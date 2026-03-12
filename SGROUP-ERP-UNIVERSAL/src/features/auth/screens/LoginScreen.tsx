/**
 * SGROUP ERP — Premium Login Screen v6
 * Immersive split-screen with cinematic brand panel, floating 3D logo, and ultra-polished form
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, Image,
  StyleSheet, Platform, KeyboardAvoidingView, ScrollView,
  ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sgds } from '../../../shared/theme/theme';
import { useAuthStore } from '../store/authStore';
import { apiAuthProvider } from '../services/providers/apiAuth';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react-native';

const R = '#D42027';
const R_DARK = '#9F1219';
const R_LIGHT = '#F87171';
const W_BG = '#F4F7FB';

const isWeb = Platform.OS === 'web';
const noOutline: any = isWeb ? { outlineStyle: 'none' } : {};
const INTER = isWeb ? { fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" } : {};

export function LoginScreen() {
  const { login, setLoading, setError, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('admin@sgroup.vn');
  const [pw, setPw] = useState('123456');
  const [showPw, setShowPw] = useState(false);
  const [fEmail, setFEmail] = useState(false);
  const [fPw, setFPw] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);
  const [wide, setWide] = useState(Dimensions.get('window').width >= 1024);

  /* Animations */
  const floatY = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const fade = useRef(new Animated.Value(0)).current;

  // Staggered tag animations
  const tagAnims = useRef(Array(4).fill(0).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Initial entry animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, friction: 10, tension: 40, useNativeDriver: true }),
      ]),
      Animated.stagger(150, tagAnims.map(a => 
        Animated.spring(a, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true })
      ))
    ]).start();

    // Continuous floating and pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -12, duration: 3000, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 4000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    const sub = Dimensions.addEventListener('change', () =>
      setWide(Dimensions.get('window').width >= 1024));
    return () => sub?.remove?.();
  }, []);

  const doLogin = async () => {
    if (!email || !pw) { setError('Vui lòng nhập email và mật khẩu'); return; }
    setLoading(true);
    try {
      const r = await apiAuthProvider.login(email, pw);
      login(r.user, r.token);
    } catch (e: any) { setError(e.message || 'Đăng nhập thất bại'); }
  };

  /* ═════════════════════════════════════════ */
  return (
    <View style={s.root}>
      {/* Background layer for form side */}
      {isWeb && (
        <View style={s.bgDecoList}>
          <View style={[s.formBgMesh, { background: 'radial-gradient(circle at 100% 0%, rgba(212,32,39,0.03), transparent 50%)' } as any]} />
          <View style={[s.formBgMesh, { background: 'radial-gradient(circle at 0% 100%, rgba(59,130,246,0.02), transparent 50%)' } as any]} />
        </View>
      )}

      <View style={wide ? s.rowWide : s.colNarrow}>
        
        {/* ████ LEFT — CINEMATIC BRAND PANEL ████ */}
        <Animated.View style={[wide ? s.brandPanelW : s.brandPanelN, { opacity: fade }]}>
          {/* Deep immersive gradients */}
          <LinearGradient 
            colors={[R_DARK, R, '#E43037']} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} 
            style={StyleSheet.absoluteFillObject} 
          />

          {isWeb && (
            <View style={s.bgDecoList}>
              {/* Massive ambient auroras */}
              <Animated.View style={[s.aurora, { 
                top: '-20%', right: '-20%', width: 800, height: 800, background: 'radial-gradient(circle, rgba(239,68,68,0.4), transparent 60%)',
                transform: [{ scale: pulse }]
              } as any]} />
              <Animated.View style={[s.aurora, { 
                bottom: '-15%', left: '-15%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(153,27,27,0.4), transparent 65%)',
                transform: [{ scale: pulse }]
              } as any]} />
              
              {/* Glassmorphic rings */}
              <View style={[s.glassRing, { top: '15%', left: '10%', width: 250, height: 250 }]} />
              <View style={[s.glassRing, { bottom: '20%', right: '15%', width: 180, height: 180, transform: [{ rotate: '45deg' }] } as any]} />
            </View>
          )}

          <View style={wide ? s.brandContentW : s.brandContentN}>
            
            {/* HERO LOGO: 3D Elevated Pill */}
            <Animated.View style={[
              wide ? s.logoWrap : s.logoWrapSm, 
              { transform: [{ translateY: floatY }] },
              isWeb && s.logoGlow
            ]}>
              <View style={wide ? s.logoPlate : s.logoPlateSm}>
                <Image
                  source={require('../../../../assets/images/Logo 3_noFont.png')}
                  style={wide ? s.logoImg : s.logoImgSm}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            {/* Typography */}
            <Animated.View style={{ transform: [{ translateY: slideUp }] }}>
              <Text style={wide ? s.brandTitle : s.brandTitleSm}>SGROUP</Text>
              <View style={s.taglineBar}>
                <Text style={s.taglineTxt}>PHỤNG SỰ BẰNG CẢ TRÁI TIM</Text>
              </View>

              {wide && (
                <>
                  <Text style={s.descTxt}>
                    Nền tảng quản trị doanh nghiệp toàn diện,{'\n'}kiến tạo tương lai số hóa.
                  </Text>
                  
                  {/* Staggered animated trust tags */}
                  <View style={s.tagsGrid}>
                    {['Bất động sản', 'Tài chính - Kế toán', 'Nhân sự', 'Marketing'].map((tag, i) => (
                      <Animated.View 
                        key={i} 
                        style={[s.tagItem, { 
                          opacity: tagAnims[i], 
                          transform: [{ translateY: tagAnims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] 
                        }]}
                      >
                        <CheckCircle2 size={14} color="#FFF" style={{ opacity: 0.8 }} />
                        <Text style={s.tagItemTxt}>{tag}</Text>
                      </Animated.View>
                    ))}
                  </View>
                </>
              )}
            </Animated.View>

          </View>
          {wide && <Text style={s.erpLabel}>ENTERPRISE RESOURCE PLANNING</Text>}
        </Animated.View>


        {/* ████ RIGHT — ELEVATED FORM PANEL ████ */}
        <Animated.View style={[
          wide ? s.formPanelW : s.formPanelN, 
          { opacity: fade, transform: [{ translateY: slideUp }] }
        ]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
            <ScrollView contentContainerStyle={wide ? s.formScrollW : s.formScrollN} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              
              {/* Form Card */}
              <View style={[s.formCard, isWeb && s.formCardShadow]}>
                
                {!wide && (
                  <View style={s.mobileLogoRow}>
                    <Image source={require('../../../../assets/images/Logo 3_noFont.png')} style={{width: 32, height: 32}} resizeMode="contain" />
                    <Text style={s.mobileLogoTxt}>SGROUP</Text>
                  </View>
                )}

                <View style={s.welcomeWrap}>
                  <Text style={s.welcomeTitle}>Đăng nhập nền tảng</Text>
                  <Text style={s.welcomeSub}>Truy cập hệ sinh thái quản trị SGROUP</Text>
                </View>

                {/* EMAIL */}
                <View style={s.field}>
                  <Text style={s.lbl}>Email</Text>
                  <View style={[
                    s.inpWrap, 
                    fEmail && s.inpWrapFocus,
                    isWeb && ({ transition: 'all 0.3s ease' } as any)
                  ]}>
                    <View style={[s.iconBox, fEmail && s.iconBoxActive]}>
                      <Mail size={16} color={fEmail ? '#FFF' : '#A1A8B8'} />
                    </View>
                    <TextInput
                      value={email} onChangeText={setEmail}
                      onFocus={() => setFEmail(true)} onBlur={() => setFEmail(false)}
                      placeholder="admin@sgroup.vn" placeholderTextColor="#B4BAC6"
                      keyboardType="email-address" autoCapitalize="none"
                      style={[s.inp, noOutline]}
                    />
                  </View>
                </View>

                {/* PASSWORD */}
                <View style={[s.field, { marginTop: 20 }]}>
                  <View style={s.lblRow}>
                    <Text style={s.lbl}>Mật khẩu</Text>
                    <Pressable style={isWeb && (sgds.cursor as any)}>
                      <Text style={s.forgot}>Quên mật khẩu?</Text>
                    </Pressable>
                  </View>
                  <View style={[
                    s.inpWrap, 
                    fPw && s.inpWrapFocus,
                    isWeb && ({ transition: 'all 0.3s ease' } as any)
                  ]}>
                    <View style={[s.iconBox, fPw && s.iconBoxActive]}>
                      <Lock size={16} color={fPw ? '#FFF' : '#A1A8B8'} />
                    </View>
                    <TextInput
                      value={pw} onChangeText={setPw}
                      onFocus={() => setFPw(true)} onBlur={() => setFPw(false)}
                      placeholder="••••••••" placeholderTextColor="#B4BAC6"
                      secureTextEntry={!showPw}
                      style={[s.inp, noOutline]}
                    />
                    <Pressable onPress={() => setShowPw(!showPw)} style={[s.eyeBtn, isWeb && (sgds.cursor as any)]}>
                      {showPw ? <EyeOff size={18} color="#A1A8B8" /> : <Eye size={18} color="#A1A8B8" />}
                    </Pressable>
                  </View>
                </View>

                {error && (
                  <View style={s.errBox}>
                    <Text style={s.errTxt}>⚠ {error}</Text>
                  </View>
                )}

                {/* LOGIN BUTTON */}
                <Pressable
                  onPress={doLogin} disabled={isLoading}
                  onHoverIn={() => setHoverBtn(true)} onHoverOut={() => setHoverBtn(false)}
                  style={[
                    { marginTop: 32 },
                    isWeb && ({
                      ...sgds.cursor,
                      transform: hoverBtn && !isLoading ? 'translateY(-2px)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    } as any)
                  ]}
                >
                  <View style={[s.btnGlow, hoverBtn && s.btnGlowOn]} />
                  <LinearGradient
                    colors={hoverBtn ? [R_LIGHT, R] : [R, R_DARK]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.btn, isLoading && { opacity: 0.7 }]}
                  >
                    {isLoading ? <ActivityIndicator color="#FFF" /> : (
                      <>
                        <Text style={s.btnTxt}>Vào hệ thống</Text>
                        <View style={s.btnIco}>
                          <ArrowRight size={18} color="#FFF" strokeWidth={3} />
                        </View>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Demo Info */}
                <View style={s.demoBox}>
                  <ShieldCheck size={16} color="#A1A8B8" />
                  <Text style={s.demoTxt}>
                    Demo: <Text style={s.demoHL}>admin@sgroup.vn</Text> / <Text style={s.demoHL}>123456</Text>
                  </Text>
                </View>
              </View>

              <Text style={s.foot}>
                © 2026 Bản quyền thuộc{'\n'}CÔNG TY TNHH BẤT ĐỘNG SẢN SGROUP.
              </Text>
              
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </View>
  );
}

/* ════════════════════ STYLES ════════════════════ */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: W_BG },
  flex: { flex: 1 },
  bgDecoList: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', pointerEvents: 'none' } as any,
  formBgMesh: { ...StyleSheet.absoluteFillObject, opacity: 0.8 } as any,

  /* Layouts */
  rowWide: { flex: 1, flexDirection: 'row' },
  colNarrow: { flex: 1, flexDirection: 'column' },

  /* ── LEFT (BRAND) ── */
  brandPanelW: { width: '45%', minHeight: '100%', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  brandPanelN: { height: 260, width: '100%', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  aurora: { position: 'absolute', borderRadius: 9999 },
  glassRing: { 
    position: 'absolute', borderRadius: 999, 
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)'
  },

  brandContentW: { alignItems: 'center', paddingHorizontal: 40, zIndex: 10 },
  brandContentN: { alignItems: 'center', zIndex: 10, marginTop: 20 },

  /* Enhanced Logo */
  logoWrap: { marginBottom: 32 },
  logoWrapSm: { marginBottom: 16 },
  logoPlate: {
    width: 180, height: 180, borderRadius: 50, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ web: { boxShadow: '0 25px 50px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.5)' } }),
  } as any,
  logoPlateSm: {
    width: 100, height: 100, borderRadius: 30, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ web: { boxShadow: '0 10px 30px rgba(0,0,0,0.2)' } }),
  } as any,
  logoImg: { width: 175, height: 175 },
  logoImgSm: { width: 95, height: 95 },
  logoGlow: { filter: `drop-shadow(0 0 80px ${R}80)` } as any,

  brandTitle: { fontSize: 46, fontWeight: '900', color: '#FFF', letterSpacing: 16, textAlign: 'center', ...INTER } as any,
  brandTitleSm: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 8, textAlign: 'center', ...INTER } as any,
  
  taglineBar: {
    marginTop: 8, paddingHorizontal: 16, paddingVertical: 4, 
    backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 20, alignSelf: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  taglineTxt: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.95)', letterSpacing: 3, ...INTER } as any,

  descTxt: {
    fontSize: 16, fontWeight: '500', color: 'rgba(255,255,255,0.8)',
    textAlign: 'center', lineHeight: 26, marginTop: 40, marginBottom: 24, ...INTER,
  } as any,

  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, maxWidth: 360 },
  tagItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  tagItemTxt: { fontSize: 13, fontWeight: '600', color: '#FFF', ...INTER } as any,

  erpLabel: { position: 'absolute', bottom: 30, fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.2)', letterSpacing: 6, ...INTER } as any,


  /* ── RIGHT (FORM) ── */
  formPanelW: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  formPanelN: { flex: 1 },

  formScrollW: { flexGrow: 1, justifyContent: 'center', padding: 40, width: '100%' },
  formScrollN: { flexGrow: 1, padding: 24, paddingVertical: 40 },

  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 28, padding: 48, width: '100%', maxWidth: 480, alignSelf: 'center',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  formCardShadow: { boxShadow: '0 25px 70px -10px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.03)' } as any,

  mobileLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  mobileLogoTxt: { fontSize: 20, fontWeight: '900', color: R, letterSpacing: 3, ...INTER } as any,

  welcomeWrap: { marginBottom: 36 },
  welcomeTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5, ...INTER } as any,
  welcomeSub: { fontSize: 15, fontWeight: '500', color: '#64748B', marginTop: 8, ...INTER } as any,

  /* Field */
  field: {},
  lblRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  lbl: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 10, letterSpacing: 0.3, ...INTER } as any,
  forgot: { fontSize: 13, fontWeight: '600', color: R, ...INTER } as any,

  inpWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 16, height: 56, paddingRight: 6,
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  inpWrapFocus: {
    backgroundColor: '#FFF', borderColor: R,
    ...Platform.select({ web: { boxShadow: `0 0 0 4px ${R}15, 0 4px 12px rgba(0,0,0,0.04)` } }),
  } as any,

  iconBox: {
    width: 44, height: 44, borderRadius: 12, marginLeft: 6,
    backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ web: { transition: 'all 0.25s ease' } }),
  } as any,
  iconBoxActive: { backgroundColor: R },
  
  inp: { flex: 1, height: '100%', paddingHorizontal: 12, fontSize: 15, fontWeight: '500', color: '#1E293B', ...INTER } as any,
  eyeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },

  errBox: { marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  errTxt: { fontSize: 14, fontWeight: '600', color: '#DC2626', ...INTER } as any,

  /* Button */
  btnGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, backgroundColor: R, filter: 'blur(12px)', opacity: 0 } as any,
  btnGlowOn: { opacity: 0.4 },
  
  btn: {
    height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  btnTxt: { fontSize: 16, fontWeight: '800', color: '#FFF', letterSpacing: 0.5, ...INTER } as any,
  btnIco: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  /* Demo */
  demoBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 32, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9',
  },
  demoTxt: { fontSize: 13, fontWeight: '500', color: '#64748B', ...INTER } as any,
  demoHL: { fontWeight: '700', color: '#1E293B' },

  foot: { fontSize: 12, fontWeight: '500', color: '#94A3B8', marginTop: 32, textAlign: 'center', lineHeight: 20, ...INTER } as any,
});
