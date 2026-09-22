brifingda aytilgan profile oynasida user id yuborilsin shunga qarab qaysi userning malumoti o'zgartish kerak ekanligin aniqlanadi deyilingan lekin men bundan qochdim va buning o'rniga sessiya dan userni aniqlab olishni maqul topdim sabab user id dev tools orqali o'zgartitirilsa bo'ladi va bu o'z navbatida havf tug'duradi

② SSR isboti (eng muhimi): DevTools oching → Cmd + Shift + P → Disable JavaScript deb yozib tanlang → sahifani yangilang. JavaScript o'chiq bo'lsa ham header to'g'ri. Ya'ni uni brauzer emas, server tayyorlab yuboryapti. Keyin yana Cmd + Shift + P → Enable JavaScript.

onboarding qismida account.ts ichida fhunctionga userId ni qo'shib jo'natmayman sabab boshqa birov o'zgartirmasligi uchun, uni appwrite ozi aniqlaydi mijoz karta raqamiga qarab

onboarding sahifasida profile update qilingandan keyin home oynasiga yo'naltirmadim sababb user nimalar o'zgarganini ko'zi bilan ko'rib turgani yaxshiroq, home ga yo'naltirsam user nima o'zgarganini bilishi uchun yana qaytib kelishga to'g'ri kelar edi

7-qadam log out cookie tozalanadi appwriteda ham sessiya ochiriladii lekin umumiy mijoz ochib ketmaydi profile appwriteda saqlanib qoladi

Vitest orqali havsizlikni tekshirdim, boshqa saytlardan kirish log out qilinganda profilega kirsa sign in ga yo'naltirish barchasi testdan o'tdi

# Qarorlar va izohlar

## Umumiy yondashuv

Brauzer Appwrite bilan to'g'ridan-to'g'ri gaplashmaydi. Hamma chaqiruvlar
serverda bo'ladi, sessiya httpOnly cookie'da saqlanadi — shuning uchun
brauzerdagi JavaScript sessiyani ham, API key'ni ham ko'ra olmaydi.

Sign-in paytida admin client (API key bilan) ishlatiladi — sessiya
secret'ini Appwrite faqat shunda beradi. Qolgan hamma joyda foydalanuvchi
sessiyasi ishlatiladi. Function'ni admin client bilan chaqirib bo'lmaydi:
u foydalanuvchini faqat Appwrite qo'yadigan `x-appwrite-user-id`
headeridan taniydi, bu header esa faqat sessiya bilan kelgan so'rovda
bo'ladi.

## Brief'dagi rozi bo'lmagan joylarim

**"redirect parametridagi sahifaga yuborish"** — bu open redirect teshigi.
`/sign-in?redirect=//soxta-sayt.uz` havolasi yuborilsa, odam haqiqiy
saytda kodini kiritadi, keyin soxta saytga tushadi. Yechim — `safeRedirect`: faqat
ichki yo'llarga ruxsat, boshqasi `/` ga.

**"Profil formasi user id'ni ham yuborsin"** — bajarmadim. Brauzer
yuboradigan narsani foydalanuvchi o'zgartira oladi: id'ni almashtirib,
begona profilni o'zgartirish mumkin bo'lardi. Function kimligini sessiyadan
biladi, demak id keraksiz ham xavfli ham.

**"Har qanday xatoda cookie'ni o'chir"** — noto'g'ri. Internet bir soniya
uzilsa, odam tizimdan chiqib ketardi, sessiyasi soz bo'lgani holda. Faqat
Appwrite 401 qaytarganda (sessiya haqiqatan yaroqsiz) cookie o'chiriladi.
Boshqa xatolarda sessiya saqlanadi, "qayta harakat qib ko'r " ko'rsatiladi.

## Qo'shimcha qarorlar

**Header'da email.** Kirgan, lekin hali profil yaratmagan odamning ismi
yo'q. Brief bu holatni aytmagan; "Sign in" ko'rsatish noto'g'ri bo'lgani
uchun ism o'rniga email ko'rsatiladi.

**Profil alohida so'ralmaydi.** Header uchun baribir "bu kim va profili
bormi" kerak, shuning uchun profil o'sha so'rovda keladi va /profile
shundan foydalanadi. Bitta manba, bitta so'rov.

**Faqat o'zgargan maydonlar yuboriladi.** Hammasini yuborsak, boshqa
qurilmadagi o'zgarishni bosib tashlash ehtimoli bor. Bo'shatilgan maydon
`null` bo'lib ketadi — Function tozalashni aynan shunday kutadi, bo'sh
satrni qabul qilmaydi.

**Ikki marta bosish — uch qatlam.** Tugma so'rov ketayotganda o'chadi;
Function idempotent; jadvalda unique index bor. Uchinchisi eng muhimi:
ikki so'rov bir vaqtda kelsa, faqat index ikkinchisini to'xtata oladi.

**Log out ikki ish qiladi.** Faqat cookie'ni o'chirish yetmaydi — sessiya
Appwrite tomonida tirik qolardi. Avval sessiya o'chiriladi, keyin cookie.
Appwrite xato bersa ham cookie baribir o'chiriladi.

**Function o'zgartirilmadi** — ehtiyoj bo'lmadi.

## Setup paytida uchragan muammolar

- `appwrite login` ishlamadi: CLI 8 belgili kod chiqardi, Console 6 belgi
  qabul qiladi. Vaqtinchalik API key bilan ulandim, keyin uni o'chirdim.
- `appwrite push table` ustunlarni yarata olmadi (endi mavjud bo'lmagan
  `collections.write` ruxsatini so'raydi). Ustunlar va unique index'ni
  qo'lda yaratdim, Function'ni `appwrite push function` bilan yukladim.
- Ilova kaliti faqat to'rt ruxsatga ega: `sessions.write`, `users.read`,
  `users.write`, `execution.write`.

## Production uchun keyingi qadamlar

- **O'z rate limit'imiz.** Appwrite API key bilan kelgan so'rovlarni
  cheklamaydi, ya'ni hozir kodni tanlab topishga urinish mumkin.
- **Log out'da butun keshni tozalash** — keshda boshqa shaxsiy ma'lumotlar
  paydo bo'lganda kerak bo'ladi.
- **E2E testlar** asosiy oqimlar uchun (hozir faqat `safeRedirect`
  qoplangan).
- **Keraksiz auth usullarini o'chirish** — faqat Email OTP ishlatiladi.
