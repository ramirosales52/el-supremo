import whatsappIcon from "../assets/whatsapp-icon.svg";

export default function WhatsAppButton() {
  const phone = "5493472646441";
  const message = encodeURIComponent("¡Hola! Quiero hacer una consulta sobre los productos.");
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110 active:scale-95"
    >
      <img src={whatsappIcon} alt="" className="size-7 brightness-0 invert" />
    </a>
  );
}
