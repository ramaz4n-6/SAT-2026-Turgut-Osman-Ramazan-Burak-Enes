# 🐬 MySQL Veritabanı Geliştirici Kılavuzu (Bozok 66)

Arkadaşların doğrudan **MySQL / XAMPP / phpMyAdmin / MySQL Workbench** kullanarak bağlanabilmesi için hazırlanmıştır.

## 🚀 1. Adım: Veritabanını Oluşturun
1. XAMPP veya MySQL servisinizi başlatın.
2. `phpMyAdmin` veya `MySQL Workbench`'i açın.
3. Bu klasördeki **`bozok66.sql`** dosyasını **İçe Aktar (Import)** yapın veya SQL sekmesinde yapıştırıp çalıştırın.
   - Bu işlem `bozok66` veritabanını, tabloları (`users`, `duty_pharmacies`, `bus_routes`) ve örnek verileri otomatik oluşturur.

---

## ⚙️ 2. Adım: Bağlantı Ayarları (`database.py`)
Varsayılan olarak XAMPP ayarları tanımlıdır:
- **Kullanıcı:** `root`
- **Şifre:** *(boş)*
- **Port:** `3306`
- **Veritabanı:** `bozok66`

Eğer MySQL şifreniz varsa `.env` veya `database.py` içindeki `DB_PASSWORD` kısmına şifrenizi yazmanız yeterlidir.

---

## 📦 3. Adım: Gerekli Paketler
```bash
pip install -r requirements.txt
```
*(PyMySQL ve SQLAlchemy otomatik kurulacaktır.)*

---

## 🛠️ Kod İçinde Kullanım Örneği

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

# MySQL'den Kullanıcıları Çek
@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

# MySQL'e Yeni Kullanıcı Kaydet (Kayıt Ol)
@router.post("/register")
def register_user(full_name: str, email: str, password: str, db: Session = Depends(get_db)):
    user = models.User(full_name=full_name, email=email, hashed_password=password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"status": "success", "user_id": user.id}
```
