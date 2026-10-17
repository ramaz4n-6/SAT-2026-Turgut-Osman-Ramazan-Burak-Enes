import React, { useState } from 'react';
import { Alert } from 'react-native';
import { spacing } from '../theme';
import { Screen, ScreenHeader, Card, ServiceCard, SectionHeader, ActionRow, PrimaryButton } from '../components/ui';
import BusScheduleModal from '../components/BusScheduleModal';

const USER_PARAM = "@user_id='USR_66_DEMO'";

export default function TransportScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const triggerLog = (buttonTitle: string, queryAction: string, table: string) => {
    const timestamp = new Date().toISOString();
    console.log(`\n======================================================`);
    console.log(`[SQL & DB EVENT] Tıklanan Buton: [${buttonTitle}]`);
    console.log(`[QUERY] EXEC sp_${queryAction} ${USER_PARAM}, @timestamp='${timestamp}'`);
    console.log(`[DATABASE] BozokDB -> Table: '${table}' -> Status: CONNECTED`);
    console.log(`[RESULT] Success: Mock kayıt başarıyla işlendi ve loglandı.`);
    console.log(`======================================================\n`);

    Alert.alert('İşlem Tetiklendi', `${buttonTitle}\n\n[DB Log]: '${table}' tablosuna istek gönderildi.`);
  };

  return (
    <Screen>
      <ScreenHeader title="Ulaşım & Seyahat" caption="Otobüs seferleri, kart ve duraklar" />

      <ServiceCard icon="bus-outline" title="Canlı Otobüs Seferleri" subtitle="Kampüs ve şehir hatları hareket saatleri">
        <PrimaryButton
          title="Otobüs Nerede? (Saatleri Gör)"
          icon="bus-outline"
          onPress={() => setModalVisible(true)}
          style={{ marginTop: spacing.md }}
        />
      </ServiceCard>

      <Card>
        <SectionHeader title="Ulaşım Hizmetleri" caption="Kent ulaşım servisleri" />
        <ActionRow
          icon="card-outline"
          title="Bozok Kart Bakiye Yükle"
          caption="Toplu taşıma kartı"
          onPress={() => triggerLog('Bozok Kart Bakiye Yükle', 'TopUpCardBalance', 'tbl_card_transactions')}
        />
        <ActionRow
          icon="time-outline"
          title="Otobüs Saatleri (Canlı)"
          caption="Tüm hatların hareket çizelgesi"
          onPress={() => setModalVisible(true)}
        />
        <ActionRow
          icon="location-outline"
          title="En Yakın Durak (GPS)"
          caption="Konuma göre durak sorgusu"
          onPress={() => triggerLog('En Yakın Durak Sorgula', 'FindNearestStop', 'tbl_bus_stops')}
        />
        <ActionRow
          icon="car-outline"
          title="Taksi Çağır"
          caption="Yakındaki taksi durağı"
          onPress={() => triggerLog('Taksi Çağır', 'RequestTaxiRide', 'tbl_taxi_requests')}
          last
        />
      </Card>

      <BusScheduleModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </Screen>
  );
}
