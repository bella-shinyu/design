// Selected records transcribed from the supplied February 2026 web appendix.
(() => {
  const documented = 'Documented in appendix';
  const tokens = [
    ['Colour','button/color/primary','#D62872','pink/pink500','Primary action button','Semantic colour mapping',2,documented],
    ['Colour','button/color/primary-pressed','#AC205D','pink/pink600','Primary button pressed state','Semantic colour mapping',2,documented],
    ['Colour','text/color/primary','#404040','gray/gray750','Standard body text','Semantic colour mapping',2,documented],
    ['Colour','text/color/tertiary','#B3B3B3','gray/gray300','Tertiary supporting text','Semantic colour mapping',2,'Contrast review flagged in appendix'],
    ['Colour','status/color/error','#DD2222','red/red500','Error and alert feedback','Semantic colour mapping',3,documented],
    ['Colour','status/color/success','#269B24','lightGreen/lightGreen625','Success feedback','Semantic colour mapping',3,documented],
    ['Colour','bg/color/surface','#FAFAFA','gray/gray20','Page background','Semantic colour mapping',2,documented],
    ['Typography','text/size/md','15px','Primitive font size','Primary body text','Tailwind: text-size-base · iOS / Android: textMD',8,documented],
    ['Typography','text/height/md','20px','Primitive line height','Primary body text line height','Tailwind: text-height-base · iOS / Android: textMD',9,documented],
    ['Typography','text/weight/bold','700','Primitive font weight','Bold text','Tailwind: font-bold · iOS: textBold · Android: Bold',9,documented],
    ['Spacing','spacing/4','16px','Primitive spacing','Standard spacing and page padding','Tailwind: p-4 / gap-4 · iOS / Android: spacing4',10,documented],
    ['Spacing','padding/component/base','16px','spacing/4','Default padding for primary buttons and input fields','Underlying spacing mapping: p-4 / gap-4',10,documented],
    ['Spacing','padding/container/desktop','32px','Web-only container padding','Desktop container padding from 1024px','Web platform rule',11,documented],
    ['Radius','radius/component/md','6px','borderRadius/md','Buttons, tags, chips, notifications and alerts','Underlying radius: rounded-md · iOS / Android: radiusMD',12,'Tentative semantic definition'],
    ['Radius','radius/component/lg','8px','borderRadius/lg','Cards, panels, dropdowns and menus','Underlying radius: rounded-lg · iOS / Android: radiusLG',12,'Tentative semantic definition'],
    ['Shadow','shadow/card','3px 3px 10px 0px rgba(0,0,0,0.10)','Figma card effect','Default card shadow','Figma effect named in appendix',13,'Design-source value identified in appendix'],
    ['Shadow','elevation/floating','0px 4px 12px 0px rgba(0,0,0,0.12)','shadow/md','Floating buttons, popovers and dropdowns','Front-end supplementary elevation',13,'Front-end addition · design confirmation pending'],
    ['Motion','duration/slow','300ms','Duration','Opening overlays and sliding sheets','Existing project setting',14,documented],
    ['Motion','easing/standard','cubic-bezier(0.32, 1, 0.23, 1)','Easing curve','Sheet entrance and exit motion','Existing project setting',14,documented],
    ['Z-index','z/modal','400','Global layer','Modals, dialogs and sheets','Semantic layer above z/overlay (300)',15,documented],
    ['Z-index','z/toast','600','Global layer','Toast and snackbar feedback','Highest visible feedback layer in documented scale',15,documented]
  ].map(([category,name,value,reference,usage,mapping,page,status]) => ({category,name,value,reference,usage,mapping,page,status}));
  const search = document.querySelector('#token-search');
  const category = document.querySelector('#token-category');
  const list = document.querySelector('#token-list');
  const detail = document.querySelector('#token-detail');
  if (!search || !category || !list || !detail) return;
  let selected = tokens[0];
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function renderDetail() {
    detail.replaceChildren();
    if (!selected) {
      detail.append(node('p', 'Try another name, value, usage or foundation.', 'empty-state'));
      return;
    }
    detail.append(node('span', selected.category, 'detail-category'), node('h3', selected.name));
    const preview = node('div', selected.value, 'detail-preview');
    if (selected.category === 'Colour') {
      const swatch = node('i');
      Object.assign(swatch.style, {background:selected.value,width:'36px',height:'36px',marginRight:'12px',border:'1px solid #ddd',flexShrink:'0'});
      preview.prepend(swatch);
    }
    if (selected.category === 'Shadow') preview.style.boxShadow = selected.value;
    if (selected.category === 'Radius') preview.style.borderRadius = selected.value;
    if (selected.category === 'Motion') preview.style.fontSize = '13px';
    detail.append(preview);
    const dl = node('dl');
    for (const [label, value] of [['Reference',selected.reference],['Usage',selected.usage],['Implementation context',selected.mapping],['Source',`Front-end web appendix · February 2026 · p. ${selected.page}`]]) {
      const row = node('div');row.append(node('dt',label),node('dd',value));dl.append(row);
    }
    detail.append(dl,node('span',selected.status,'review-tag'));
  }
  function render() {
    const query = search.value.trim().toLowerCase();
    const matches = tokens.filter(token => (category.value === 'all' || token.category === category.value) && Object.values(token).join(' ').toLowerCase().includes(query));
    if (!matches.includes(selected)) selected = matches[0];
    document.querySelector('#token-count').textContent = `${matches.length} ${matches.length === 1 ? 'record' : 'records'} · selected appendix excerpt`;
    const scroll = list.scrollTop;
    list.replaceChildren();
    if (!matches.length) list.append(node('p','No matching tokens. Try “primary” or choose another foundation.','empty-state'));
    matches.forEach(token => {
      const button = node('button',null,'token-row');button.type='button';button.setAttribute('aria-pressed',String(token === selected));
      const swatch = node('i',token.category === 'Colour' ? '' : 'Aa');
      if (token.category === 'Colour') swatch.style.background=token.value;
      const text = node('span');text.append(node('code',token.name),node('small',`${token.category} · ${token.value}`));button.append(swatch,text);
      button.addEventListener('click',() => {
        selected=token;
        list.querySelectorAll('button').forEach(row=>row.setAttribute('aria-pressed',String(row===button)));
        renderDetail();
      });
      list.append(button);
    });
    list.scrollTop=scroll;
    renderDetail();
  }
  search.addEventListener('input',render);
  category.addEventListener('change',render);
  render();
})();

// Keep both source images at a fixed size while moving the reveal boundary.
(() => {
  const range = document.querySelector('#momo-compare-range');
  if (!range) return;
  const frame = range.closest('.momo-image-compare');
  const update = () => {
    const value = Number(range.value);
    frame.style.setProperty('--compare-position', `${value}%`);
    range.setAttribute('aria-valuetext', `${value}% before, ${100 - value}% after`);
    frame.querySelector('.compare-label-before').hidden = value < 15;
    frame.querySelector('.compare-label-after').hidden = value > 85;
  };
  range.addEventListener('input', update);
  update();
})();
