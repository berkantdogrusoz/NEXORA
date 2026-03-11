# Higgsfield (ve Diğer Modeller) API vs UI Farkı & Çözüm Stratejisi

## Mevcut Sorun Nedir?
Kullanıcının Higgsfield, Kling veya Seedance gibi platformların kendi web sitelerinde (UI) gördüğü **"Cinema Studio 2.0"**, **"Epic Movie Scenes"**, **"Sora 2 Trends"** gibi havalı özellikler, bu firmaların API'leri üzerinden dışarıya sunduğu özellikler **değildir.**

O firmaların sitelerindeki butonlar aslında arka planda devasa birer "Prompt Yönlendiricisi" (Enhancer) olarak çalışır. Yani kullanıcı "Kavga eden bir kedi ve adam" yazdığında, o buton arka planda sessizce *"RAW live-action camera, hyper-realistic, 8k resolution, cinematic lighting, no CGI..."* gibi profesyonel komutları ekler. 

NEXORA platformu bu firmalara API üzerinden bağlandığında bu "sihirli buton" filtresinden geçemediği için, kelimeler API'ye "ham/ilkel" haliyle gider ve sonuçlar genelde basit, CGI (çizgi film) benzeri veya gerçeklikten uzak çıkar.

## Çözüm: NEXORA Backend Prompt Enhancer (Zenginleştirici)
NEXORA'da kullanıcıların da "Cinema Studio" kalitesinde videolar üretebilmesi için araya kendi **Prompt Enhancer'ımızı (Prompt Zenginleştirme Sistemini)** kurmamız gerekiyor. Bu sistem OpenAI (GPT-4o-mini vb.) kullanılarak `app/api/video/generate/route.ts` dosyasında video API'ye gitmeden hemen önce çalışacak.

### Teknik Uygulama (Nasıl Yapılacak?)
1. Kullanıcıdan gelen kısa/basit prompt alınacak.
2. Bu prompt API'ye (Kling, Seedance vb.) gitmeden hemen önce hızlı çalışan bir LLM'e (Örn: GPT-4o-mini) yollanacak.
3. LLM'e sıkı bir "System Prompt" (Sistem komutu) verilerek, kullanıcının o basit cümlesini Hollywood seviyesinde bir yönetmen komutuna çevirmesi istenecek.
4. Elde edilen **Zenginleştirilmiş İngilizce Prompt**, video üretici API'ye gönderilecek.

---

## Geliştirici AI İçin Sistem Talimatı (System Prompt) Örneği
Arka planda çalışacak GPT-4o-mini için şu tarz bir kimlik (Role) ve kurallar silsilesi eklenmelidir:

```text
You are an expert Hollywood AI video prompt engineer. Your job is to take a simple user idea and organically rewrite it into a highly detailed, professional, and descriptive prompt for a photorealistic video generation model (like Kling, Sora, or Higgsfield).

CRITICAL RULES:
1. FORCE EXTREME REALISM: Unless the user specifically asks for animation, anime, or 3D, always enforce strict photorealism.
2. INJECT KEYWORDS: Organically weave in keywords like: "RAW live-action smartphone footage, hyper-realistic, no CGI, cinematic lighting, 8k resolution, dynamic camera movement, motion blur."
3. ADD DETAIL: Describe actions, textures, and subjects with extreme detail (e.g., instead of "a cat", write "a fluffy, muscular ginger street cat with highly detailed fur").
4. PHYSICS & CHOREOGRAPHY: If the prompt involves fighting or rapid movement, emphasize realistic physics, impacts, and genuine choreography.
5. ENGLISH ONLY: Translate the user's input to English if it's in another language.
6. OUTPUT ONLY THE PROMPT: Return ONLY the newly generated, highly detailed English prompt. Do not use quotes, pleasantries, or extra text.
```

### Kodlama İçin Son Adımlar (Geliştirici Ye Not)
* Lütfen `app/api/video/generate/route.ts` dosyasını aç.
* Mevcut kodda (tahminen 163. satır civarı) GPT-4o-mini ile yapılan çok basit bir "Translate" (Çeviri) bloğu var. 
* O çeviri bloğunu tamamen silip, yerine yukarıdaki "System Prompt" mantığına sahip, güçlü bir "Prompt Enhancer" (Geliştirici) bloğu yaz.
* Bu geliştirilmiş promptu (englishPrompt), Kling, Seedance, Runway, Luma ve Sora kod bloklarına başarıyla aktar. 
