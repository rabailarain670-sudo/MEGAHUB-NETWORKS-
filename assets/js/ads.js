// Adsterra Integration with density awareness
const Ads = {
  units: {
    '728x90': 'ca62188f74ef0038211200819287107d',
    '160x600': '3786c373fb067d1092814cd741ef7d0d',
    '320x50': '8b1e3d61861d1c17368c4fd4e1eecf52',
    '300x250': '4f52a4b1f5dba3d1b6bf80d44634631d',
    '468x60': 'c992751dba51ea4600c3e3b94c90b0af',
    'native': 'f61a4274586f36ba796ad9362c93a165'
  },

  init() {
    setTimeout(() => this.render(), 2000); // 2s delay for LCP
  },

  render() {
    const density = MegaHub.state.settings.adDensity;
    const placeholders = document.querySelectorAll('.ad-placeholder');

    placeholders.forEach(el => {
      if (el.dataset.hide === 'true') return;
      const type = el.dataset.type;
      const key = this.units[type];
      if (!key) return;

      if (type === 'native') {
        this.injectNative(el, key);
      } else {
        this.injectIframe(el, key, type);
      }
    });
  },

  injectIframe(el, key, type) {
    const [w, h] = type.split('x');
    const container = document.createElement('div');
    container.className = 'ad-container';
    
    const atOptions = {
      'key' : key,
      'format' : 'iframe',
      'height' : parseInt(h),
      'width' : parseInt(w),
      'params' : {}
    };

    const script = document.createElement('script');
    script.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;
    container.appendChild(script);

    const invoker = document.createElement('script');
    invoker.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
    container.appendChild(invoker);

    el.appendChild(container);
  },

  injectNative(el, key) {
    const container = document.createElement('div');
    container.className = 'ad-container';
    container.id = `container-${key}`;
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pl28380256.effectivegatecpm.com/${key}/invoke.js`;
    
    el.appendChild(container);
    el.appendChild(script);
  }
};
Ads.init();