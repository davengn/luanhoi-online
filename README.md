# Luân Hồi Online (Reincarnation & Cultivation 3D Social Multiplayer RPG)

> **"Tích công đức – Tu luyện thành tiên – Độ kiếp phi thăng – Hoặc sa vào 18 tầng địa ngục."**

**Luân Hồi Online** là tựa game nhập vai nhiều người chơi (3D Social Multiplayer RPG) chạy trực tiếp trên trình duyệt, lấy cảm hứng từ văn hóa Phật giáo, tín ngưỡng dân gian Á Đông & Việt Nam, luật Nhân Quả – Luân Hồi, hệ thống Tu Tiên Độ Kiếp và 18 Tầng Địa Ngục.

---

## ✨ Tính Năng Nổi Bật

- **Thế Giới 3D Liên Thông 3 Cõi (Three.js / React Three Fiber)**:
  - **Phàm Giới (Chùa Linh Sơn Cổ Tự)**: Sân Chánh Điện, Đại Hùng Bảo Điện, Hồ Liên Hoa, Lầu Chuông Đại Hồng Chung, Lư Hương, Đình Lần Chuỗi, Rừng Trúc & Thác Nước, Thư Viện Trí Tuệ và Cổng Phán Xét Nghiệp Lực.
  - **Thiên Đình (Cửu Trùng Vân Cung)**: Nam Thiên Môn, Vân Cung, Hồ Tiên Liên, Đình Tiên Nhân và Đài Độ Kiếp.
  - **Âm Phủ & 18 Tầng Địa Ngục**: Sông Vọng Xuyên, Cầu Nại Hà, Nghiệp Kính Đài (Phán Quan Thôi Giác) và **18 tầng địa ngục riêng biệt** từ *Tầng 1: Vọng Ngôn* đến *Tầng 18: Vô Gián* với cơ chế chuộc lỗi và thức tỉnh.
- **Hệ Thống Công Đức & Nghiệp Lực (`Server-Authoritative`)**:
  - 12 hoạt động tích Công Đức (Lễ Phật, Thiền Định, Lần Chuỗi Mõ, Dâng Hương, Dâng Hoa Sen, Đọc Kinh, Nghe Pháp, Giúp Đỡ Chúng Sinh, Cộng Tu, Thả Hoa Đăng, Quét Chùa, Đại Lễ 108 Lạy) với cooldown, giới hạn giảm dần trong ngày (`dailySoftCap`) và sổ ghi chép lịch sử giao dịch (`Karma Ledger`).
  - Lựa chọn đạo đức trong **Thư Viện Trí Tuệ**: Phân biệt rõ giáo lý Phật giáo nguyên bản (trích dẫn *Pāli Nikāya / Āgama* & *Đại Thừa*) với truyền thuyết dân gian và tu tiên giả tưởng.
- **12 Cảnh Giới Tu Luyện & 6 Đại Kiếp Nạn**:
  - Từ *Phàm Nhân* đến *Thiên Đạo Cảnh*, mở khóa Thiên Đình từ bậc 7 (*Phi Thăng Giả*) sau khi vượt qua Lôi Kiếp, Hỏa Kiếp, Tâm Ma Kiếp, Phong Kiếp, Nghiệp Lực Kiếp và Thiên Đạo Chung Kiếp.
- **Âm Thanh Phật Giáo Thực Tế**:
  - Tích hợp 11 bản thu âm Phật giáo bản quyền mở (chuông chùa, chuông xoay Tây Tạng, chuông gia trì *Rin*, tiếng mõ tụng kinh, tụng *Bát Nhã Tâm Kinh*, tụng *Buddham Saranam Gacchami*, không gian chùa và chuông gió).
- **Multiplayer Thời Gian Thực (WebSocket 10Hz)**:
  - Đồng bộ vị trí, hướng xoay, hành động lễ bái/ngồi thiền, biểu cảm, chat nhanh, tự động phân tách phòng (`Auto-Sharding`), hàng đợi Thiền Đường và sự kiện cộng đồng (*Đại Lễ Bái Sám 108 Lạy*, *Hội Hoa Đăng*).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Game

### 1. Chạy trực tiếp trên Node.js (Khuyên dùng cho Development)
```bash
npm install
npm run dev
```
- **3D Web Game Client**: `http://localhost:5173`
- **Multiplayer & Economy Server**: `http://localhost:3001` (`ws://localhost:3001/ws`)

### 2. Kiểm thử & Đóng gói Production
```bash
npm test          # Chạy 19 bài kiểm thử tự động (Vitest)
npm run build     # Kiểm tra kiểu TypeScript và build bản Production
```

### 3. Chạy bằng Docker / WSL Docker
```bash
wsl docker compose up --build -d
```

---

## 📚 Tài Liệu Dự Án (`docs/`)

- [`docs/product-requirements.md`](docs/product-requirements.md) — Yêu cầu sản phẩm (PRD)
- [`docs/game-design.md`](docs/game-design.md) — Thiết kế gameplay, 12 cấp bậc, kinh tế & cân bằng
- [`docs/lore-and-content.md`](docs/lore-and-content.md) — Nghiên cứu Phật học, cốt truyện & 18 Tầng Địa Ngục
- [`docs/art-direction.md`](docs/art-direction.md) — Định hướng mỹ thuật 3D & âm thanh
- [`docs/asset-manifest.md`](docs/asset-manifest.md) — Danh mục 42 tài nguyên 3D `.glb`, PBR textures & âm thanh Phật giáo
- [`docs/technical-architecture.md`](docs/technical-architecture.md) — Kiến trúc kỹ thuật
- [`docs/multiplayer-protocol.md`](docs/multiplayer-protocol.md) — Giao thức đồng bộ hóa Multiplayer WebSocket
- [`docs/database-schema.md`](docs/database-schema.md) — Thiết kế cơ sở dữ liệu
- [`docs/api-contracts.md`](docs/api-contracts.md) — Đặc tả REST API
- [`docs/development-roadmap.md`](docs/development-roadmap.md) — Lộ trình phát triển
- [`docs/testing-report.md`](docs/testing-report.md) — Báo cáo kiểm thử tự động & đa phiên trình duyệt
