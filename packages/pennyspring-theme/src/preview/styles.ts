import { createUseSheetStyle } from '../createUseSheetStyle';

export const usePreviewStyles = createUseSheetStyle(tokens => ({
  container: { flex: 1, backgroundColor: tokens.colorBgBase },
  familyGroup: { marginBottom: 12 },
  familyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: tokens.colorText,
  },
  spacingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  spacingLabel: {
    width: 100,
    fontSize: 12,
    fontFamily: 'monospace',
    color: tokens.colorText,
  },
  spacingValue: {
    marginLeft: 8,
    fontSize: 12,
    color: tokens.colorTextSecondary,
  },
  shadowBox: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: tokens.colorFillSecondary,
    borderRadius: 8,
  },
  shadowLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: tokens.colorText,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  radiusLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: tokens.colorText,
  },
}));
