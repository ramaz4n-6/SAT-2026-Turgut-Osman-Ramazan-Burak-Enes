import React from 'react';
import { Alert } from 'react-native';
import { spacing } from '../theme';
import { Screen, ScreenHeader, Card, ServiceCard, SectionHeader, ActionRow, PrimaryButton } from '../components/ui';

const STUDENT_PARAM = "@student_no='2026140066'";

export default function CampusScreen() {
  const triggerLog = (buttonTitle: string, queryAction: string, table: string) => {
    const timestamp = new Date().toISOString();
    console.log(`\n======================================================`);
    console.log(`[SQL & DB EVENT] Tıklanan Buton: [${buttonTitle}]`);
    console.log(`[QUERY] EXEC sp_${queryAction} ${STUDENT_PARAM}, @timestamp='${timestamp}'`);
    console.log(`[DATABASE] BozokDB -> Table: '${table}' -> Status: CONNECTED`);
    console.log(`[RESULT] Success: Mock öğrenci/kampüs kaydı doğrulandı.`);
    console.log(`======================================================\n`);

    Alert.alert('İşlem Tetiklendi', `${buttonTitle}\n\n[DB Log]: '${table}' tablosuna istek gönderildi.`);
  };

  return (
    <Screen>
      <ScreenHeader title="Kampüs & Öğrenci" caption="Yemekhane, kütüphane ve akademik takvim" />

      <ServiceCard icon="restaurant-outline" title="Yemekhane Menüsü" subtitle="Günün yemek listesini sorgula">
        <PrimaryButton
          title="Günün Yemek Menüsü"
          icon="restaurant-outline"
          onPress={() => triggerLog('Yemekhane Menüsü Sorgula', 'GetCafeteriaMenu', 'tbl_cafeteria_menu')}
          style={{ marginTop: spacing.md }}
        />
      </ServiceCard>

      <Card>
        <SectionHeader title="Öğrenci Hizmetleri" caption="Kampüs servisleri" />
        <ActionRow
          icon="card-outline"
          title="Dijital Öğrenci Kimliği"
          caption="Kimlik doğrulama"
          onPress={() => triggerLog('Öğrenci Kimlik Doğrulama', 'VerifyStudentCard', 'tbl_student_profiles')}
        />
        <ActionRow
          icon="library-outline"
          title="Kütüphane Doluluk Durumu"
          caption="Anlık kapasite kontrolü"
          onPress={() => triggerLog('Kütüphane Doluluk Kontrolü', 'CheckLibraryCapacity', 'tbl_library_logs')}
        />
        <ActionRow
          icon="calendar-outline"
          title="Akademik Takvim"
          caption="Dönem tarihleri ve etkinlikler"
          onPress={() => triggerLog('Akademik Takvim Çek', 'GetAcademicCalendar', 'tbl_academic_events')}
          last
        />
      </Card>
    </Screen>
  );
}
