import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '../config';

interface LoginScreenProps {
  onLoginSuccess: (user: { id: number; full_name: string; email: string }) => void;
}

type Mode = 'login' | 'register';

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Uyarı', 'E-posta ve şifre alanları boş bırakılamaz.');
      return;
    }
    if (mode === 'register' && !fullName.trim()) {
      Alert.alert('Uyarı', 'Ad Soyad alanı boş bırakılamaz.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { email: email.trim(), password }
          : { full_name: fullName.trim(), email: email.trim(), password };

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const json = await res.json();

      if (!res.ok) {
        Alert.alert('Hata', json.detail || 'Bir hata oluştu.');
        return;
      }

      if (mode === 'register') {
        Alert.alert('Başarılı!', 'Kayıt tamamlandı. Şimdi giriş yapabilirsiniz.', [
          { text: 'Giriş Yap', onPress: () => setMode('login') },
        ]);
      } else {
        onLoginSuccess(json.user);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        Alert.alert('Zaman Aşımı', 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve sunucunun çalıştığını kontrol edin.');
      } else {
        Alert.alert('Bağlantı Hatası', 'Sunucuya ulaşılamıyor. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Başlık */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>66</Text>
            </View>
            <Text style={styles.appTitle}>Bozok 66</Text>
            <Text style={styles.appSubtitle}>Yozgat'ın Süper Uygulaması</Text>
          </View>

          {/* Kart */}
          <View style={styles.card}>
            {/* Sekme */}
            <View style={styles.tabRow}>
              <Pressable
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                  Giriş Yap
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, mode === 'register' && styles.tabActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                  Kayıt Ol
                </Text>
              </Pressable>
            </View>

            {/* Ad Soyad (sadece kayıt) */}
            {mode === 'register' && (
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#a78bfa" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  placeholderTextColor="#6b7280"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* E-posta */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#a78bfa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta adresi"
                placeholderTextColor="#6b7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Şifre */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#a78bfa" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Şifre"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#6b7280"
                />
              </Pressable>
            </View>

            {/* Giriş / Kayıt Butonu */}
            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
              onPress={handleSubmit}
              disabled={loading}
              accessibilityLabel={mode === 'login' ? 'giris-yap-butonu' : 'kayit-ol-butonu'}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <LinearGradient
                  colors={['#7c3aed', '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                  </Text>
                  <Ionicons
                    name={mode === 'login' ? 'arrow-forward' : 'checkmark'}
                    size={18}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                </LinearGradient>
              )}
            </Pressable>

            {/* Demo bilgisi */}
            {mode === 'login' && (
              <View style={styles.demoBox}>
                <Ionicons name="information-circle-outline" size={14} color="#a78bfa" />
                <Text style={styles.demoText}>
                  {'  '}Demo: ogrenci@bozok.edu.tr / 123456
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.footer}>© 2026 Bozok 66 · Turgut · Osman · Ramazan · Burak · Enes</Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  appTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  appSubtitle: { fontSize: 13, color: '#a78bfa', marginTop: 4 },

  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    marginBottom: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#7c3aed' },
  tabText: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.15)',
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  eyeBtn: { padding: 4 },

  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  submitBtnPressed: { opacity: 0.85 },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  demoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderRadius: 8,
    padding: 10,
  },
  demoText: { color: '#a78bfa', fontSize: 12 },

  footer: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    marginTop: 32,
    textAlign: 'center',
  },
});
