"""Development-only merge. Never use dev-preview as an eXe Online export."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from bs4 import BeautifulSoup
import shutil
import xml.etree.ElementTree as ET

BASE=Path(__file__).resolve().parents[1]
folder=BASE/'exelearning/pilot'
for cid in ('ITE',):
    target=folder/'dev-preview'/cid
    shutil.copytree(folder/'preview'/cid,target,dirs_exist_ok=True)
    with ZipFile(next((folder/'sources').glob(cid+'*.elpx'))) as source:
        for name in source.namelist():
            if name.startswith(('theme/','content/resources/')):
                output=target/name
                output.parent.mkdir(parents=True,exist_ok=True)
                output.write_bytes(source.read(name))
        xml=ET.fromstring(source.read('content.xml'))
        views=[n.text for n in xml.findall('.//{http://www.intef.es/xsd/ode}htmlView') if 'exe-text-template' in (n.text or '')]
    html=BeautifulSoup((target/'index.html').read_text(encoding='utf-8'),'html.parser')
    old=html.select('.exe-text-template')
    assert len(old)==len(views)==5
    for node,view in zip(old,views):
        node.replace_with(BeautifulSoup(view.replace('{{context_path}}','content/resources'),'html.parser'))
    (target/'index.html').write_text(str(html),encoding='utf-8')
with ZipFile(next((folder/'sources').glob('ITE*.elpx'))) as source, ZipFile(folder/'LCM_IT_Enterprise_Theme.zip','w',ZIP_DEFLATED) as theme:
    for name in source.namelist():
        if name.startswith('theme/'):theme.writestr(name[6:],source.read(name))
print('Updated dev-preview only; theme ZIP prepared for platform import.')
