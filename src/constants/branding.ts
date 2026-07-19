export const productBrand = {
  name: 'RolloutHQ™',
  description: 'Enterprise Rollout Management Platform',
  developer: 'Francois Botha',
  licensee: 'Francois Botha',
  customer: 'PSG',
  partner: 'Colourpix (Pty) Ltd',
  workspace: 'PSG National Signage Rollout',
  licenseStatus: 'Licensed',
  version: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
  poweredBy: 'Powered by RolloutHQ™',
  copyright: '© 2026 Francois Botha',
} as const;

export const userAgreementPoints = [
  'Project activity is recorded.',
  'Communications may be retained.',
  'Administrators may audit activity.',
  'AI suggestions require human approval.',
  'Files remain the property of their respective owners.',
  'RolloutHQ™ is licensed software.',
] as const;