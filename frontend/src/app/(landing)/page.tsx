import Link from "next/link";
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline"
import { ChevronDownIcon } from "@heroicons/react/24/solid"
import Image from 'next/image';

export default function Landing() {

  const services = [
    {
      title: "Gemi Takip ve Raporlama",
      items: [
        "Günlük Gemi Takip Listesi",
        "Kuzey-Güney Geçiş Listesi",
        "Güney-Kuzey Geçiş Listesi",
        "Tanker Trafiği",
        "Boğaz Geçiş Raporları",
      ],
    },
    {
      title: "Liman ve Acentelik Hizmetleri",
      items: [
        "Çanakkale ve Çevre Limanlarında Acentelik",
        "İzmit Körfezinde Acentelik",
        "Koruyucu Acentelik Hizmetleri",
      ],
    },
    {
      title: "Gemi İşletmeciliği",
      items: ["Armatörlük", "Gemi Kiralama", "Gemi İşletme"],
    },
    {
      title: "Diğer Hizmetler",
      items: [
        "Kumanya ve Teknik Malzeme İkmali",
        "Motor Hizmeti",
        "Personel Değişimi",
        "Sörvey İşlemleri",
      ],
    },
  ];

  return (

    <div id="scroll-snap-main" className="relative h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">

      {/* Header */}
      <header className="snap-start flex justify-between items-center bg-white/90 backdrop-blur-sm border-b shadow-sm
      border-gray-200 h-16 z-50 sticky top-0">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl text-black font-bold">K-MARITIME</h1>
          <div className="flex gap-5">
            <ul className="flex gap-5 items-center text-gray-500">
              <li><Link href="#home" className="hover:text-black cursor-pointer">Ana Sayfa</Link></li>
              <li><Link href="#about" className="hover:text-black cursor-pointer">Hakkımızda</Link></li>
              <li><Link href="#services" className="hover:text-black cursor-pointer">Hizmetler</Link></li>
              <li><Link href="#contact" className="hover:text-black cursor-pointer">İletişim</Link></li>
            </ul>
            <Link href="/login" className="btn btn-sm btn-black rounded hover:text-gray-500">Giriş Yap</Link>
              {/* Dil seçimi */}
            <div className="flex items-center">
              <select className="bg-transparent border-black rounded focus:outline-none
              px-1 py-1 text-gray-500 hover:border-black hover:text-black cursor-pointer">
                <option value="tr">🇹🇷</option>
                <option value="en">🇺🇸</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative h-[calc(100vh-4rem)] flex items-center justify-center snap-end"
      >
        {/* Background Image */}
        <Image
          src="/hero.jpeg"           
          alt="Maritime background"
          fill                       
          priority                   
          quality={90}              
          sizes="100vw"             
          className="object-cover object-center"  
        />

        {/* Content */}
        <div className="container mx-auto relative z-10">
          <div className="flex justify-center flex-col gap-6 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight text-gray-900">
              Denizcilik Sektöründe<br />
              <span className="text-gray-500">Güvenilir Ortağınız</span>
            </h1>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              K-Maritime olarak, gemi acenteliği hizmetlerinde uzman ekibimizle her müşterimize kendilerinin tek müşterimizmiş gibi özel ilgi gösteriyor, denizcilik sektöründe güvenilir çözümler sunuyoruz.
            </p>
          </div>
        </div>

        {/* Scroll Down Arrows */}
        <Link href="#about" className="cursor-pointer absolute bottom-5 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce z-20">
          <ChevronDownIcon className="w-10 h-10 text-black/70 mb-1" />
          <ChevronDownIcon className="w-8 h-8 text-black/70 mb-1" />
          <ChevronDownIcon className="w-6 h-6 text-black/70" />
        </Link>
      </section>


      {/* About Section */}
      <section
        id="about"
        className="h-screen py-20 bg-gradient-to-br from-neutral-950 to-gray-900 snap-start flex justify-center items-center"
      >
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Metin Alanı */}
            <div>
              <h2 className="text-4xl font-semibold text-white mb-6">Hakkımızda</h2>
              <p className="text-base text-gray-300 mb-6 leading-relaxed">
                Denizcilik sektöründe 20 yılı aşkın deneyimiyle Türkiye&apos;nin önde gelen gemi acentelik şirketlerinden biridir. Profesyonel ekibimiz ve güçlü lojistik ağımızla müşterilerimize kesintisiz hizmet sunuyoruz.
              </p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2 mt-2 w-2 h-2 bg-white rounded-full"></span>
                  Profesyonel gemi acentelik hizmetleri
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-2 w-2 h-2 bg-white rounded-full"></span>
                  7/24 operasyonel destek
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-2 w-2 h-2 bg-white rounded-full"></span>
                  Güvenilir lojistik çözümler
                </li>
              </ul>
            </div>

            {/* Sayılar/Kart Alanı */}
            <div className="relative">
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold text-white">10.000+</div>
                    <div className="text-sm text-gray-300 mt-1">Başarılı Operasyon</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">500+</div>
                    <div className="text-sm text-gray-300 mt-1">Memnun Müşteri</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-3xl font-bold text-white">20+</div>
                    <div className="text-sm text-gray-300 mt-1">Yıllık Deneyim</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      <section
      id="services"
      className="relative h-screen w-full py-20 snap-start flex justify-center items-center bg-white overflow-hidden"
    >
      {/* Siyah çizgi animasyon arka plan */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-white bg-grid-lines animate-lines" />
      </div>

      {/* İçerik */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-black mb-4">Hizmetlerimiz</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Denizcilik sektöründe ihtiyaç duyduğunuz tüm hizmetleri tek çatı altında sunuyoruz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="border border-black rounded-xl p-6 bg-white/80 hover:bg-black hover:text-white transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold mb-4">{service.title}</h3>
              <ul className="space-y-2 text-sm">
                {service.items.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>


      {/* Contact Section */}
      <section
        id="contact"
        className="h-screen py-20 bg-gradient-to-br from-neutral-950 to-gray-900 snap-start flex justify-center items-center"
      >
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Bizimle İletişime Geçin
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Denizcilik ihtiyaçlarınız için profesyonel çözümler arıyorsanız, uzman ekibimizle hemen iletişime geçin.
              </p>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                    <PhoneIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Telefon</div>
                    <div className="text-gray-300">+90 212 123 45 67</div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                    <EnvelopeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">E-posta</div>
                    <div className="text-gray-300">info@k-maritime.com</div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Adres</div>
                    <div className="text-gray-300">İstanbul, Türkiye</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
              <form className="space-y-6">
                <input
                  type="text"
                  placeholder="Adınız Soyadınız"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-gray-400"
                />
                <input
                  type="email"
                  placeholder="E-posta Adresiniz"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-gray-400"
                />
                <textarea
                  rows={4}
                  placeholder="Mesajınız"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-gray-400"
                ></textarea>
                <button
                  type="submit"
                  className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors duration-300"
                >
                  Mesaj Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-white backdrop-blur-md border py-8 snap-start">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">K-MARITIME</h3>
              <p className="text-gray-600 leading-relaxed">
                Denizcilik sektöründe güvenilir ortağınız. Profesyonel hizmet anlayışımızla her zaman yanınızdayız.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-gray-900 cursor-pointer">Ana Sayfa</li>
                <li className="hover:text-gray-900 cursor-pointer">Hakkımızda</li>
                <li className="hover:text-gray-900 cursor-pointer">Hizmetler</li>
                <li className="hover:text-gray-900 cursor-pointer">İletişim</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Kariyer</h4>
              <p className="text-gray-400 mb-2">
                Ekibimize katılmak ister misiniz? Açık pozisyonlar ve başvuru için bizimle iletişime geçin.
              </p>
              <a href="mailto:kariyer@k-maritime.com" className="text-gray-600 hover:underline">
                kariyer@k-maritime.com
              </a>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">İletişim</h4>
              <div className="space-y-2 text-gray-400">
                <div>+90 212 123 45 67</div>
                <div>info@k-maritime.com</div>
                <div>Çanakkale, Türkiye</div>
              </div>

              <div className="flex gap-4 mt-4">
                {/* Sosyal Medya İkonları */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.2 3-3.2.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.4 3h-1.8v7A10 10 0 0 0 22 12z" /></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4 1a9.1 9.1 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.3 0c-2.5 0-4.5 2.1-4.5 4.7 0 .4 0 .8.1 1.1A12.9 12.9 0 0 1 3 1.7a4.77 4.77 0 0 0-.6 2.3c0 1.6.8 3 2.1 3.8a4.44 4.44 0 0 1-2-.6v.1c0 2.2 1.5 4.1 3.6 4.5a4.52 4.52 0 0 1-2 .1c.5 1.7 2 2.9 3.8 2.9A9.05 9.05 0 0 1 2 19a12.8 12.8 0 0 0 7 2.1" /></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.45 20.45H17.7v-5.4c0-1.3-.5-2.2-1.6-2.2s-1.7.9-1.7 2.2v5.4H11.7V9h2.7v1.6c.4-.7 1.4-1.7 3.1-1.7 2.3 0 3.4 1.5 3.4 4.3v7.2zM5.3 7.5c-.9 0-1.5-.7-1.5-1.6s.6-1.6 1.5-1.6 1.5.7 1.5 1.6-.6 1.6-1.5 1.6zM6.8 20.45H3.8V9h3v11.45zM22.2 0H1.8C.8 0 0 .8 0 1.8v20.4C0 23.2.8 24 1.8 24h20.4c1 0 1.8-.8 1.8-1.8V1.8C24 .8 23.2 0 22.2 0z" /></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} K-Maritime. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
