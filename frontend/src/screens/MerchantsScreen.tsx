import React from 'react';
import { Alert } from 'react-native';
import { spacing } from '../theme';
import { Screen, ScreenHeader, Card, ServiceCard, SectionHeader, ActionRow, PrimaryButton } from '../components/ui';

const CATEGORY_PARAM = "@category='Retail_Food'";

export default function MerchantsScreen() {
  const triggerLog = (buttonTitle: string, queryAction: string, table: string) => {
    const timestamp = new Date().toISOString();
    console.log(`\n======================================================`);
    console.log(`[SQL & DB EVENT] Tıklanan Buton: [${buttonTitle}]`);
    console.log(`[QUERY] EXEC sp_${queryAction} ${CATEGORY_PARAM}, @timestamp='${timestamp}'`);
    console.log(`[DATABASE] BozokDB -> Table: '${table}' -> Status: CONNECTED`);
    console.log(`[RESULT] Success: Mock esnaf ve indirim işlemi tamamlandı.`);
    console.log(`======================================================\n`);

    Alert.alert('İşlem Tetiklendi', `${buttonTitle}\n\n[DB Log]: '${table}' tablosuna istek gönderildi.`);
  };

  return (
    <Screen>
      <ScreenHeader title="Esnaf & İndirimler" caption="Yerel esnaf, kuponlar ve karekod ödeme" />

      <ServiceCard icon="storefront-outline" title="Esnaf İndirimleri" subtitle="Öğrenci dostu işletmeler">
        <PrimaryButton
          title="İndirimleri Getir"
          icon="pricetag-outline"
          onPress={() => triggerLog('Esnaf İndirimlerini Getir', 'GetMerchantDiscounts', 'tbl_merchants_discounts')}
          style={{ marginTop: spacing.md }}
        />
      </ServiceCard>

      <Card>
        <SectionHeader title="Esnaf Hizmetleri" caption="Kupon ve ödeme servisleri" />
        <ActionRow
          icon="ticket-outline"
          title="Öğrenci İndirim Kuponu Al"
          caption="Öğrenci kimliğiyle kupon"
          onPress={() => triggerLog('Öğrenci Kuponu Al', 'ClaimStudentCoupon', 'tbl_user_coupons')}
        />
        <ActionRow
          icon="qr-code-outline"
          title="Karekod ile Öde"
          caption="QR ile hızlı ödeme"
          onPress={() => triggerLog('QR ile Ödeme Yap', 'ProcessMerchantQRPayment', 'tbl_payments_qr')}
        />
        <ActionRow
          icon="hand-right-outline"
          title="Esnaf İndirim Başvurusu Yap"
          caption="İşletmenizi ekleyin"
          onPress={() => triggerLog('Esnaf Başvurusu Gönder', 'SubmitMerchantApplication', 'tbl_merchant_applications')}
          last
        />
      </Card>
    </Screen>
  );
}
