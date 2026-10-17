import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing, type } from '../theme';
import { AppInput, PrimaryButton } from './ui';
import { API_BASE } from '../config';
import UniversalModal from './UniversalModal';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: { name: string; email: string }) => void;
}

export default function AuthModal({ visible, onClose, onLoginSuccess }: AuthModalProps) {
  const insets = useSafeAreaInsets();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    if (!isLoginTab && !fullName.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen adınızı ve soyadınızı girin.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLoginTab ? '/api/auth/login' : '/api/auth/register';
      const body = isLoginTab
        ? { email: trimmedEmail, password: trimmedPassword }
        : { full_name: fullName.trim(), email: trimmedEmail, password: trimmedPassword };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Giriş Yapılamadı', data.detail || 'Bir hata oluştu.');
        return;
      }

      if (isLoginTab) {
        // Gerçek MySQL veritabanından gelen kullanıcı bilgisi
        const userName = data.user?.full_name || trimmedEmail.split('@')[0];
        Alert.alert('Giriş Başarılı', `Hoş geldiniz, ${userName}! (MySQL bozok66 doğrulandı)`);
        
        if (onLoginSuccess) {
          onLoginSuccess({ name: userName, email: trimmedEmail });
        }
        setFullName('');
        setEmail('');
        setPassword('');
        onClose();
      } else {
        // Kayıt başarılı -> MySQL users tablosuna yazıldı
        Alert.alert('Kayıt Başarılı', `${data.user?.full_name}, hesabınız oluşturuldu! Şimdi giriş yapabilirsiniz.`);
        setIsLoginTab(true);
        setPassword('');
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        Alert.alert('Zaman Aşımı', 'Sunucuya bağlanılamadı. Backend ve MySQL (Laragon) servislerinin açık olduğunu kontrol edin.');
      } else {
        Alert.alert('Bağlantı Hatası', 'Backend sunucusuna ulaşılamadı. Lütfen sunucunun (port 8000) açık olduğunu kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal visible={visible} onClose={onClose} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Kapat" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.grabber} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{isLoginTab ? 'Tekrar Hoş Geldiniz' : 'Hesap Oluştur'}</Text>
            <Text style={styles.sheetSubtitle}>
              {isLoginTab
                ? 'Bozok 66 giriş yapın.'
                : 'Yozgat kent hizmetlerine erişmek için yeni kayıt olun.'}
            </Text>
          </View>

          <View style={styles.segmentControl}>
            <Pressable
              style={[styles.segmentBtn, isLoginTab && styles.segmentBtnActive]}
              onPress={() => setIsLoginTab(true)}
            >
              <Text style={[styles.segmentText, isLoginTab && styles.segmentTextActive]}>Giriş Yap</Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, !isLoginTab && styles.segmentBtnActive]}
              onPress={() => setIsLoginTab(false)}
            >
              <Text style={[styles.segmentText, !isLoginTab && styles.segmentTextActive]}>Kayıt Ol</Text>
            </Pressable>
          </View>

          {!isLoginTab ? (
            <AppInput
              label="Ad Soyad"
              placeholder="Ad Soyad"
              value={fullName}
              onChangeText={setFullName}
              style={styles.field}
            />
          ) : null}

          <AppInput
            label="E-posta Adresi"
            placeholder="ornek@bozok.edu.tr"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={styles.field}
          />

          <AppInput
            label="Şifre"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.field}
          />

          {isLoginTab && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                Kayıtlı Test Hesabı: ogrenci@bozok.edu.tr | Şifre: 123456
              </Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.loadingText}>MySQL Doğrulanıyor...</Text>
            </View>
          ) : (
            <PrimaryButton
              title={isLoginTab ? 'Giriş Yap' : 'Hesap Oluştur'}
              icon={isLoginTab ? 'log-in-outline' : 'person-add-outline'}
              onPress={handleSubmit}
              style={{ marginTop: spacing.sm }}
            />
          )}

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Vazgeç / Kapat</Text>
          </Pressable>
        </View>
      </View>
    </UniversalModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    ...shadow.modal,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceContainerHigh,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetHeader: {
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
  sheetSubtitle: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    padding: 4,
    marginBottom: spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadow.floating,
  },
  segmentText: {
    ...type.labelMd,
    color: colors.onSurfaceVariant,
  },
  segmentTextActive: {
    color: colors.primary,
  },
  field: {
    marginBottom: spacing.md,
  },
  hintContainer: {
    backgroundColor: colors.primaryFixed,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: spacing.sm,
  },
  hintText: {
    ...type.labelSm,
    color: colors.primary,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  loadingText: {
    ...type.labelMd,
    color: colors.primary,
  },
  closeBtn: {
    marginTop: spacing.sm,
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeBtnText: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
