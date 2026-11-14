import os
import shutil
import json
import xml.etree.ElementTree as ET
from zipfile import ZipFile, ZIP_DEFLATED
from bs4 import BeautifulSoup
from pathlib import Path

BASE = Path(r"D:\2026\Scorm LCM\perancangan-kegiatan-statistik")
OUT = BASE / "exelearning/pilot"
CID = "S01"
COURSE_TITLE = "S01 Persiapan Penyelenggaraan Kegiatan Statistik"

def build_export():
    elpx_path = next((OUT / "sources").glob(f"{CID}*.elpx"))
    source_z = ZipFile(elpx_path)
    
    # Target directory for building the exported files
    export_staging = OUT / "staging" / CID
    if export_staging.exists():
        shutil.rmtree(export_staging)
    export_staging.mkdir(parents=True, exist_ok=True)
    
    # 1. Copy base libraries and idevice scripts from C12 preview
    c12_preview = OUT / "preview/C12"
    for folder in ["idevices", "libs"]:
        shutil.copytree(c12_preview / folder, export_staging / folder, dirs_exist_ok=True)
    
    for f in ["content.dtd", "imslrm.xml"]:
        if (c12_preview / f).exists():
            shutil.copy(c12_preview / f, export_staging / f)
            
    # 2. Extract theme and content from the S01 .elpx
    for name in source_z.namelist():
        if name.startswith(("theme/", "content/")):
            dest = export_staging / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(source_z.read(name))
            
    # Fallback copy for content/css and content/img if not in .elpx
    if (c12_preview / "content/css").exists() and not (export_staging / "content/css").exists():
        shutil.copytree(c12_preview / "content/css", export_staging / "content/css", dirs_exist_ok=True)
    if (c12_preview / "content/img").exists() and not (export_staging / "content/img").exists():
        shutil.copytree(c12_preview / "content/img", export_staging / "content/img", dirs_exist_ok=True)

    # Also save content.xml into package
    (export_staging / "content.xml").write_bytes(source_z.read("content.xml"))
    
    # 3. Parse content.xml to get Text blocks and Form component
    xml_tree = ET.fromstring(source_z.read("content.xml"))
    NS = "{http://www.intef.es/xsd/ode}"
    
    views = [n.text for n in xml_tree.findall(f".//{NS}htmlView") if "exe-text-template" in (n.text or "")]
    assert len(views) == 5, f"Expected 5 views, got {len(views)}"
    
    # Find form component in .elpx
    form_component = None
    for c in xml_tree.iter(f"{NS}odeComponent"):
        t = c.find(f"{NS}odeIdeviceTypeName")
        if t is not None and t.text == "form":
            form_component = c
            break
    assert form_component is not None, "Form component not found in .elpx"
    
    form_iid = form_component.find(f"{NS}odeIdeviceId").text
    form_json = form_component.find(f"{NS}jsonProperties").text
    form_html = form_component.find(f"{NS}htmlView").text
    
    # 4. Construct index.html
    html_soup = BeautifulSoup((c12_preview / "index.html").read_text(encoding="utf-8"), "html.parser")
    
    # Update title
    if html_soup.title:
        html_soup.title.string = COURSE_TITLE
    pkg_title = html_soup.select_one(".package-title")
    if pkg_title:
        pkg_title.string = COURSE_TITLE
        
    # Replace 5 text blocks
    old_text_nodes = html_soup.select(".exe-text-template")
    assert len(old_text_nodes) == 5
    for old_node, view_html in zip(old_text_nodes, views):
        # Resolve {{context_path}} to content/resources
        resolved_html = view_html.replace("{{context_path}}", "content/resources")
        new_block = BeautifulSoup(resolved_html, "html.parser")
        old_node.replace_with(new_block)
        
    # Update Form node
    form_idevice_node = html_soup.find("div", attrs={"data-idevice-type": "form"})
    if form_idevice_node:
        form_idevice_node["id"] = form_iid
        form_idevice_node["data-idevice-json-data"] = form_json
        
        # Replace the inside .exe-form-container
        old_form_container = form_idevice_node.select_one(".exe-form-container")
        if old_form_container:
            resolved_form_html = form_html.replace("{{context_path}}", "content/resources")
            new_form_soup = BeautifulSoup(resolved_form_html, "html.parser")
            old_form_container.replace_with(new_form_soup)
            
    # Also update any game-evaluation-ids if present
    eval_ids = html_soup.select_one(".game-evaluation-ids")
    if eval_ids:
        eval_ids["data-id"] = form_iid
        
    form_main = html_soup.select_one(".form-IDevice")
    if form_main:
        form_main["data-id"] = form_iid
        form_main["id"] = f"frmMainContainer-{form_iid}"
        
    # Ensure all hidden form data elements and screen-reader captions are strictly hidden
    for fd in html_soup.select(".form-Data, .game-evaluation-ids, .sr-av"):
        fd["style"] = "display:none !important;"
        
    # Save index.html
    (export_staging / "index.html").write_text(str(html_soup), encoding="utf-8")
    
    # 5. Build imsmanifest.xml
    all_files = []
    for root, dirs, files in os.walk(export_staging):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), export_staging).replace("\\", "/")
            if rel != "imsmanifest.xml":
                all_files.append(rel)
                
    manifest_lines = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<!-- Generated for SCORM 1.2 LCM Scenes -->',
        '<manifest identifier="LCM-S01-Persiapan-Penyelenggaraan-Kegiatan-Statistik" version="1.2" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">',
        '  <metadata>',
        '    <schema>ADL SCORM</schema>',
        '    <schemaversion>1.2</schemaversion>',
        '  </metadata>',
        '  <organizations default="BPS_CorpU">',
        '    <organization identifier="BPS_CorpU">',
        f'      <title>{COURSE_TITLE}</title>',
        f'      <item identifier="ITEM-S01" identifierref="RES-S01">',
        f'        <title>{COURSE_TITLE}</title>',
        '      </item>',
        '    </organization>',
        '  </organizations>',
        '  <resources>',
        '    <resource identifier="RES-S01" type="webcontent" adlcp:scormtype="sco" href="index.html">',
    ]
    
    for f in sorted(all_files):
        manifest_lines.append(f'      <file href="{f}"/>')
        
    manifest_lines.extend([
        '    </resource>',
        '  </resources>',
        '</manifest>',
        ''
    ])
    
    (export_staging / "imsmanifest.xml").write_text("\n".join(manifest_lines), encoding="utf-8")
    
    # 6. Package into SCORM 1.2 ZIP
    zip_dest = OUT / "dist_scorm" / f"{CID}_Persiapan_Penyelenggaraan_Kegiatan_Statistik_SCORM12.zip"
    with ZipFile(zip_dest, "w", ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(export_staging):
            for f in sorted(files):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, export_staging).replace("\\", "/")
                z.write(full_path, rel_path)
                
    print(f"Created SCORM 1.2 package: {zip_dest} ({os.path.getsize(zip_dest)} bytes)")
    
    # 7. Mirror identical files to preview/S01
    preview_s01 = OUT / "preview" / CID
    if preview_s01.exists():
        shutil.rmtree(preview_s01)
    shutil.copytree(export_staging, preview_s01)
    print(f"Extracted matching preview into {preview_s01}")

if __name__ == "__main__":
    build_export()
