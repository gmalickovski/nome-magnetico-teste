import { StyleSheet } from '@react-pdf/renderer';

export const COLORS = {
  gold: '#D4AF37',
  goldLight: '#E8C84A',
  dark: '#1a1a1a',
  darker: '#111111',
  darkest: '#0a0a0a',
  textPrimary: '#e5e7eb',
  textSecondary: '#a0a0a0',
  error: '#FF6B6B',
  spiritual: '#c084fc',
  success: '#10b981',
  border: 'rgba(212, 175, 55, 0.3)',
};

export const pdfStyles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.darker,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  pageLight: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  heading1: {
    fontSize: 28,
    color: COLORS.gold,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  heading2: {
    fontSize: 20,
    color: COLORS.gold,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  heading3: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  body: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goldDivider: {
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.3,
    marginVertical: 16,
  },
  numberBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 20,
    color: COLORS.gold,
    fontFamily: 'Helvetica-Bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    opacity: 0.5,
  },
});
