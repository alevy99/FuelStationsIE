export function getBrandLogoURL(brand: string | null): string | null {
  if (!brand) return null;

    const brandDomains: Record<string, string> = {
      'circle k': 'circle-k.svg',
      'applegreen': 'applegreen.svg',
      'maxol': 'maxol.png',
      'texaco': 'texaco.svg',
      'sweeney oil': 'sweeney-oil.png',
      'top': 'top-oil.png',
      'inver': 'inver.svg', 
      'emo': 'emo-oil.png',
      //'esso': 'esso.ie'
    };

    const key = brand.toLowerCase().trim();
    const domain = brandDomains[key];

    if (!domain) return null;

    return `/assets/icon/fuel-brands/${domain}`;
}