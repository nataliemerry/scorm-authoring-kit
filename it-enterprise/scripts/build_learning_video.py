"""Render a local 48-second visual lesson from the authored script and generated art.

No synthetic speech is claimed. The same script is available as an HTML transcript.
Requires Pillow, fonttools[woff], and imageio-ffmpeg.
"""
import json
import subprocess
import tempfile
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
cfg = json.loads((ROOT/'data/enhanced_interactions.json').read_text(encoding='utf-8'))
out = ROOT/'assets/video'
out.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='ite-video-') as temp:
    tmp = Path(temp)
    for font in ['bricolage-grotesque','source-sans-3']:
        ff = TTFont(ROOT/'assets/fonts'/f'{font}.woff2')
        if 'fvar' in ff:
            ff = instantiateVariableFont(ff, {'wght': 650 if font == 'bricolage-grotesque' else 450}, inplace=True)
        ff.flavor = None
        ff.save(tmp/f'{font}.ttf')
    heading = ImageFont.truetype(str(tmp/'bricolage-grotesque.ttf'), 52)
    body = ImageFont.truetype(str(tmp/'source-sans-3.ttf'), 36)
    note = ImageFont.truetype(str(tmp/'source-sans-3.ttf'), 22)
    for i, scene in enumerate(cfg['video_scenes']):
        frame = Image.new('RGB', (1280,720), '#f5f5eb')
        draw = ImageDraw.Draw(frame)
        draw.rectangle((0,0,1280,12),fill='#246a58')
        draw.text((66,62), 'IT ENTERPRISE  /  '+str(i+1)+' DARI 4',font=note,fill='#246a58')
        y = 142
        for line in textwrap.wrap(scene['title'], width=23):
            draw.text((64,y),line,font=heading,fill='#153d37');y+=62
        y += 24
        for line in textwrap.wrap(scene['body'], width=37):
            draw.text((66,y),line,font=body,fill='#254f48');y+=46
        art = Image.open(ROOT/'assets'/scene['image']).convert('RGBA')
        art.thumbnail((510,480))
        frame.paste(art,(728+(510-art.width)//2,155+(480-art.height)//2),art)
        draw.text((66,662),'Dari materi IT Enterprise · BPS Corporate University',font=note,fill='#47685e')
        frame.save(tmp/f'scene-{i}.png')
        if i == 0:frame.save(out/'ITE-service-plan-poster.webp',quality=90)
    segments=[]
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    for i in range(4):
        path=tmp/f'segment-{i}.mp4';segments.append(path)
        subprocess.run([ffmpeg,'-y','-loop','1','-i',str(tmp/f'scene-{i}.png'),'-t','12',
            '-vf',"zoompan=z='min(zoom+0.00005,1.015)':d=300:s=1280x720:fps=25",
            '-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p',str(path)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    concat=tmp/'concat.txt';concat.write_text(''.join("file '"+p.as_posix()+"'\n" for p in segments),encoding='utf-8')
    subprocess.run([ffmpeg,'-y','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(out/'ITE-service-plan.mp4')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
print('Built visual lesson: 48 seconds, four scenes, local fonts and generated assets.')
