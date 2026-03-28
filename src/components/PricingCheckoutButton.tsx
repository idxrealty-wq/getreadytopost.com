'use client';

interface PricingCheckoutButtonProps {
  packageType: string;
  label: string;
  className: string;
}

const CHECKOUT_LINKS: Record<string, string> = {
  monthly: 'https://square.link/u/M26Auzjb',
  'semi-annual': 'https://square.link/u/uGBrXdPr',
  annual: 'https://square.link/u/z7zZwqR3',
  'elite-annual': 'https://square.link/u/FkNI9CP8',
  single: 'https://square.link/u/22tY4Rla',
  credit: 'https://square.link/u/UqdJJZpR',
  'five-pack': 'https://square.link/u/15NaVu0p',
  'vault-only': '/checkout?pkg=vault-only',
  'agent-verified': 'https://square.link/u/o0gy2tby',
  'company-verified': 'https://square.link/u/Z8le2Ijg',
  'verify-my-agent': 'https://square.link/u/X74D5bgW',
  'verified-buyer-seller': 'https://square.link/u/xe0oMnV6',
  reverification: 'https://square.link/u/XjhkSbC3',
};

export default function PricingCheckoutButton({
  packageType,
  label,
  className,
}: PricingCheckoutButtonProps) {
  const href = CHECKOUT_LINKS[packageType] || '#';
  const isInternal = href.startsWith('/');

  if (isInternal) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}
