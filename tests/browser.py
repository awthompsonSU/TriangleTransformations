import threading, http.server, functools, shutil
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
from playwright.sync_api import sync_playwright, Error
handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT / 'website'))
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1366,'height':900},permissions=['clipboard-read','clipboard-write'])
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(f'http://127.0.0.1:{server.server_port}')
 page.locator('#studentName').fill('Review Student')
 page.locator('#startForm button').click()
 page.locator('#checkBtn').click()
 assert page.locator('#overallAttempted').inner_text()=='0'
 assert page.locator('#guessTriangle').count()==0
 def points():
  return page.locator('#transformedTriangle polygon, #originalTriangle polygon').evaluate_all('(els)=>els.map(el=>el.getAttribute("points").split(" ").map(p=>p.split(",").map(Number)).map(([x,y])=>[(x-50)/22-15,15-(y-50)/22]))')
 def rule():
  red,black=points()
  for typ in ['translation','reflection','rotation']:
   candidates=([{'type':typ,'dx':red[0][0]-black[0][0],'dy':red[0][1]-black[0][1]}] if typ=='translation' else [{'type':typ,'axis':a,'value':v} for a in ['x','y'] for v in range(-15,16)] if typ=='reflection' else [{'type':typ,'degrees':d,'direction':dr} for d in [90,180,270] for dr in ['cw','ccw']])
   for r in candidates:
    def move(pt):
     x,y=pt
     if typ=='translation':return [x+r['dx'],y+r['dy']]
     if typ=='reflection':return [2*r['value']-x,y] if r['axis']=='x' else [x,2*r['value']-y]
     for _ in range((r['degrees']//90*(1 if r['direction']=='ccw' else -1))%4):x,y=-y,x
     return [x,y]
    if [move(pt) for pt in black]==red:return r
  raise AssertionError('no answer')
 def fill(r):
  page.locator('input[value="'+r['type']+'"]').check()
  if r['type']=='translation':
   page.locator('#translateX').fill(str(r['dx']));page.locator('#translateY').fill(str(r['dy']))
  elif r['type']=='reflection':
   page.locator('#reflectAxis').select_option(r['axis']);page.locator('#reflectValue').fill(str(r['value']))
  else:
   page.locator('#rotateDegrees').select_option(str(r['degrees']));page.locator('#rotateDirection').select_option(r['direction'])
 seen=set()
 for i in range(30):
  r=rule();seen.add(r['type']);
  if r['type']=='rotation' and i%2==0:r={**r,'degrees':360-r['degrees'],'direction':'ccw' if r['direction']=='cw' else 'cw'}
  fill(r);page.locator('#checkBtn').click()
  assert page.locator('#guessTriangle polygon').get_attribute('points')==page.locator('#transformedTriangle polygon').get_attribute('points')
  assert page.locator('#guessTriangle polygon').get_attribute('fill')=='none'
  assert page.locator('#guessTriangle polygon').get_attribute('stroke-dasharray')=='10 7'
  assert 'A*' in page.locator('#guessTriangle').text_content()
  assert 'green dashed triangle' in page.locator('#coordinatePlane').get_attribute('aria-label')
  assert 'Correct transformation!' in page.locator('#feedback').inner_text()
  assert page.locator('#overallCorrect').inner_text()==str(i+1)
  assert page.locator('#overallAttempted').inner_text()==str(i+1)
  page.locator('#nextBtn').click()
  assert page.evaluate('document.activeElement.id')=='graphTitle'
  assert page.locator('#guessTriangle').count()==0
  assert page.locator('#guessStatus').is_hidden()
 assert len(seen)==3
 for kind in ['translation','reflection','rotation']:
  assert page.locator('#'+kind+'Correct').inner_text()=='10'
  assert page.locator('#'+kind+'Attempted').inner_text()=='10'
 # Invalid numeric entries do not count.
 page.locator('input[value="translation"]').check()
 for value in ['', '1.5', '31']:
  page.locator('#translateX').fill(value);page.locator('#translateY').fill('0');page.locator('#checkBtn').click()
  assert page.locator('#overallAttempted').inner_text()=='30'
 # Wrong answer, then correct retry never increases correct score.
 r=rule();red,black=points();fill({'type':'translation','dx':30,'dy':30});page.locator('#checkBtn').click()
 assert 'outside' in page.locator('#guessStatus').inner_text()
 assert page.locator('#guessTriangle').get_attribute('clip-path')=='url(#guessClip)'
 guess=page.locator('#guessTriangle polygon').get_attribute('points')
 actual=[[float(v) for v in pt.split(',')] for pt in guess.split()]
 assert actual==[[50+(x+45)*22,50+(-15-y)*22] for x,y in black]
 page.locator('#showCoords').check()
 assert page.locator('.coord-green span').count()==3
 assert page.locator('.coord-green span').first.inner_text()==f'A* = ({int(black[0][0]+30)}, {int(black[0][1]+30)})'
 # Invalid submissions retain the last valid overlay without scoring again.
 page.locator('#translateX').fill('1.5');page.locator('#checkBtn').click()
 assert page.locator('#guessTriangle polygon').get_attribute('points')==guess
 fill({'type':'translation','dx':0,'dy':0});page.locator('#checkBtn').click()
 assert 'outside' not in page.locator('#guessStatus').inner_text()
 assert page.locator('#overallAttempted').inner_text()=='31'
 fill(r);page.locator('#checkBtn').click()
 assert page.locator('#overallCorrect').inner_text()=='30'
 assert page.locator('#guessTriangle polygon').get_attribute('points')==page.locator('#transformedTriangle polygon').get_attribute('points')
 page.locator('#nextBtn').click();page.locator('#revealBtn').click()
 assert page.locator('#overallAttempted').inner_text()=='32'
 page.locator('#showCoords').check();assert page.locator('#coordinatesPanel').is_visible()
 # Clipboard reporting now copies a PNG of the progress section.
 assert page.locator('#emailBtn, #copyBtn, #csvBtn, #teacherEmail').count()==0
 assert page.locator('#progressStudentName').inner_text()=='Review Student'
 assert page.locator('#progressOverallCorrect').inner_text()=='30'
 assert page.locator('#progressOverallAttempted').inner_text()=='32'
 assert page.locator('#progressOverallAccuracy').inner_text()=='94%'
 page.locator('#copyProgressBtn').click()
 page.wait_for_function("document.getElementById('reportStatus').textContent.includes('Progress image copied')")
 image=page.evaluate("async()=>{const items=await navigator.clipboard.read();const blob=await items[0].getType('image/png');const bitmap=await createImageBitmap(blob);return {type:blob.type,size:blob.size,width:bitmap.width,height:bitmap.height};}")
 assert image['type']=='image/png' and image['size']>10000
 assert image['width']==1280 and image['height']>600
 assert page.locator('#progressTimestamp').get_attribute('datetime')
 page.reload();assert page.locator('#overallCorrect').inner_text()=='30';assert page.locator('#overallAttempted').inner_text()=='32'
 # Focus settings apply to the next problem, and category totals stay separate.
 for kind in ['translation','reflection','rotation']:
  page.locator('#practiceType').select_option(kind)
  if page.locator('#revealBtn').is_enabled():page.locator('#revealBtn').click()
  page.locator('#nextBtn').click()
  assert rule()['type']==kind
  # Retrying a guess always maps the original vertices, never the previous guess.
  fill({'type':'translation','dx':0,'dy':0});page.locator('#checkBtn').click()
  assert page.locator('#guessTriangle polygon').get_attribute('points')==page.locator('#originalTriangle polygon').get_attribute('points')
  old_guess=page.locator('#guessTriangle polygon').get_attribute('points')
  page.locator('#revealBtn').click()
  assert page.locator('#guessTriangle polygon').get_attribute('points')==old_guess
 # Layout widths
 for width in [1366,1024,980,768,641,640,390,320]:
  page.set_viewport_size({'width':width,'height':900})
  dims=page.evaluate('({w:innerWidth,scroll:document.documentElement.scrollWidth})')
  print('layout',dims)
  assert dims['scroll']<=width
 # The supplied local logo loads at narrow widths, with both requested footer links.
 page.locator('#universityLogo').scroll_into_view_if_needed()
 page.wait_for_function("document.getElementById('universityLogo').naturalWidth===600")
 assert page.locator('#universityLink').get_attribute('href')=='https://www.salisbury.edu/'
 assert page.locator('.author-credit a').inner_text()=='Andrew Thompson'
 assert page.locator('.author-credit a').get_attribute('href')=='https://faculty.salisbury.edu/~awthompson/welcome.htm'
 # Keep the repository free of generated screenshots.
 page.once('dialog',lambda d:d.accept());page.locator('#newStudentBtn').click();assert page.locator('#startPanel').is_visible()
 page.reload();assert page.locator('#startPanel').is_visible()
 assert not errors,errors
 print('PASS: browser: 30 correct answers across all types; validation; wrong/correct retry; reveal; practice settings; coordinates; progress PNG clipboard; storage; reset; eight layout widths. No JS errors.')
 # Attempt direct-file use; managed browser policies may forbid file URLs.
 offline=browser.new_context(offline=True)
 local=offline.new_page()
 try:
  local.goto((ROOT / 'website' / 'index.html').as_uri())
 except Error as error:
  if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(error):raise
  print('SKIP: file:// launch is blocked by managed Chromium policy; checking offline play after HTTP load instead')
  offline.set_offline(False)
  local.goto(f'http://127.0.0.1:{server.server_port}')
  offline.set_offline(True)
 local.locator('#studentName').fill('Offline Student');local.locator('#startForm button').click()
 local.locator('#revealBtn').click();assert local.locator('#overallAttempted').inner_text()=='1'
 print('PASS: standalone page gameplay while offline')
 blocked=browser.new_context()
 blocked.add_init_script("Storage.prototype.getItem=()=>{throw new Error('Blocked')};Storage.prototype.setItem=()=>{throw new Error('Blocked')};Storage.prototype.removeItem=()=>{throw new Error('Blocked')};")
 guest=blocked.new_page();guest.goto(f'http://127.0.0.1:{server.server_port}')
 guest.locator('#studentName').fill('No Storage');guest.locator('#startForm button').click()
 guest.locator('#revealBtn').click();assert guest.locator('#overallAttempted').inner_text()=='1'
 guest.once('dialog',lambda d:d.accept());guest.locator('#newStudentBtn').click();assert guest.locator('#startPanel').is_visible()
 print('PASS: play and reset when browser storage is blocked')
 browser.close()
server.shutdown()
