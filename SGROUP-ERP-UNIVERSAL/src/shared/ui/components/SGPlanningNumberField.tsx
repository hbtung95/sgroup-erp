import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAppTheme } from '../../theme/useAppTheme';

type SGPlanningNumberFieldProps = {
  value: number;
  onChangeValue: (num: number) => void;
  label?: string;
  step?: number;
  min?: number;
  max?: number;
  precision?: number;
  unit?: string;
  accent?: string;
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  readOnly?: boolean;
  compact?: boolean;
  hideBorder?: boolean;
};

const isWeb = Platform.OS === 'web';
const webOnly = <T extends object>(styles: T): T | {} => (isWeb ? styles : {});

function toNumber(value: string | number) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value ?? '')
    .replace(/\s/g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

export function SGPlanningNumberField({
  value,
  onChangeValue,
  label,
  step = 1,
  min,
  max,
  precision = 0,
  unit,
  accent,
  inputStyle,
  containerStyle,
  readOnly,
  compact,
  hideBorder,
}: SGPlanningNumberFieldProps) {
  const { theme, isDark } = useAppTheme();
  const clrAccent = accent || theme.colors.accentBlue;
  
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [text, setText] = useState(String(value ?? 0));
  const [warning, setWarning] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showWarning = useCallback((msg: string) => {
    setWarning(msg);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    warningTimer.current = setTimeout(() => setWarning(''), 2500);
  }, []);

  useEffect(() => {
    if (!focused) {
      setText(String(value ?? 0));
    }
  }, [value, focused]);

  const clamp = useCallback(
    (num: number) => {
      let next = Number.isFinite(num) ? num : 0;
      if (typeof min === 'number') next = Math.max(min, next);
      if (typeof max === 'number') next = Math.min(max, next);
      return round(next, precision);
    },
    [min, max, precision],
  );

  const handleTextChange = useCallback(
    (raw: string) => {
      // Block minus sign when min >= 0
      if (typeof min === 'number' && min >= 0 && raw.includes('-')) {
        const cleaned = raw.replace(/-/g, '');
        setText(cleaned || '0');
        showWarning('Không được nhập số âm');
        const next = clamp(toNumber(cleaned));
        onChangeValue(next);
        return;
      }
      setText(raw);
      // Immediately clamp & commit on every change
      const parsed = toNumber(raw);
      if (typeof max === 'number' && parsed > max) {
        showWarning(`Tối đa ${max}`);
      }
      const next = clamp(parsed);
      onChangeValue(next);
    },
    [min, max, clamp, onChangeValue, showWarning],
  );

  const commit = useCallback(
    (raw: string) => {
      const next = clamp(toNumber(raw));
      setText(String(next));
      onChangeValue(next);
    },
    [clamp, onChangeValue],
  );

  const stopHold = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
  }, []);

  useEffect(() => stopHold, [stopHold]);

  const stepBy = useCallback(
    (dir: 1 | -1) => {
      const next = clamp(toNumber(text || value) + step * dir);
      setText(String(next));
      onChangeValue(next);
    },
    [clamp, onChangeValue, step, text, value],
  );

  const startHold = useCallback(
    (dir: 1 | -1) => {
      if (readOnly) return;
      stepBy(dir);
      stopHold();
      timerRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => stepBy(dir), 120);
      }, 380);
    },
    [readOnly, stepBy, stopHold],
  );

  const showStepper = !readOnly;

  // ── Colors ──
  const btnBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
  const btnBgHover = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)';
  const btnBgPress = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.10)';
  const btnBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const btnBorderHover = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.15)';
  const iconColor = isDark ? '#94a3b8' : '#475569';

  // ── Step Button ──
  const preventSelect = useCallback((e: any) => { e?.preventDefault?.(); }, []);

  const StepButton = ({ dir, side }: { dir: 1 | -1; side: 'top' | 'bottom' }) => (
    <Pressable
      onPressIn={() => startHold(dir)}
      onPressOut={stopHold}
      // @ts-ignore — web-only prop to prevent text selection on click
      onMouseDown={isWeb ? preventSelect : undefined}
      style={({ pressed, hovered: btnHovered }: any) => ([
        {
          width: 26,
          height: 18,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          borderWidth: 1,
          borderColor: btnHovered ? btnBorderHover : btnBorder,
          borderBottomWidth: side === 'top' ? 0 : 1,
          borderTopLeftRadius: side === 'top' ? 6 : 0,
          borderTopRightRadius: side === 'top' ? 6 : 0,
          borderBottomLeftRadius: side === 'bottom' ? 6 : 0,
          borderBottomRightRadius: side === 'bottom' ? 6 : 0,
          backgroundColor: pressed ? btnBgPress : (btnHovered ? btnBgHover : btnBg),
        },
        webOnly({
          transition: 'all 0.15s ease',
          cursor: 'pointer',
          userSelect: 'none',
        }),
      ])}
    >
      {dir === -1
        ? <ChevronDown size={14} color={iconColor} strokeWidth={2.5} />
        : <ChevronUp size={14} color={iconColor} strokeWidth={2.5} />
      }
    </Pressable>
  );

  return (
    <View style={[{
      flexDirection: 'column',
      gap: 8,
      paddingVertical: compact ? 8 : 14,
      borderBottomWidth: hideBorder ? 0 : 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      ...webOnly({ userSelect: 'none' }),
    } as any, containerStyle]} onTouchEnd={stopHold}>
      {label && (
        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary }}>{label}</Text>
      )}

      <Pressable
        {...(isWeb ? { onHoverIn: () => setHovered(true), onHoverOut: () => setHovered(false) } : {})}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}
      >
        {/* ── Input + Unit ── */}
        <View style={{ flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {/* ── Warning tooltip (above input) ── */}
          {warning ? (
            <View style={{
              position: 'absolute',
              top: -22,
              alignSelf: 'center',
              backgroundColor: '#fef2f2',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderWidth: 1,
              borderColor: '#fecaca',
              ...webOnly({ animation: 'fadeIn 0.2s ease', whiteSpace: 'nowrap', zIndex: 10 }) as any,
            }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ef4444' }}>
                ⚠ {warning}
              </Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              editable={!readOnly}
              value={text}
              onChangeText={handleTextChange}
              onFocus={() => setFocused(true)}
              onBlur={() => { setFocused(false); commit(text); }}
              keyboardType="numeric"
              style={[
                {
                  fontSize: compact ? 16 : 18,
                  fontWeight: '800',
                  color: clrAccent,
                  textAlign: 'center',
                  minWidth: compact ? 48 : 56,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  borderRadius: 10,
                  backgroundColor: isDark ? `${clrAccent}1A` : `${clrAccent}0D`,
                },
                inputStyle,
                webOnly({ 
                  outlineStyle: 'none',
                  transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                }),
                focused && webOnly({
                  boxShadow: `0 0 0 2px ${clrAccent}33`,
                }),
              ]}
            />
            {unit && (
              <Text style={{
                fontSize: compact ? 12 : 14,
                fontWeight: '700',
                color: isDark ? '#64748b' : '#94a3b8',
                marginLeft: 4,
              }}>
                {unit}
              </Text>
            )}
          </View>
        </View>

        {/* ── Stepper Buttons (Vertical) ── */}
        <View style={[
          { flexDirection: 'column' },
          webOnly({
            transition: 'opacity 0.18s ease, transform 0.18s ease',
            opacity: showStepper ? 1 : 0,
            transform: showStepper ? 'translateX(0)' : 'translateX(-6px)',
            pointerEvents: showStepper ? 'auto' : 'none',
          }),
          !isWeb && !showStepper && { opacity: 0, pointerEvents: 'none' as const },
        ]}>
          <StepButton dir={1} side="top" />
          <StepButton dir={-1} side="bottom" />
        </View>
      </Pressable>
    </View>
  );
}
