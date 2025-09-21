import { ChefHat } from "lucide-react";

export default function Footer() {
  const footerLinks = {
    company: [
      { href: "#about", label: "About us" },
      { href: "#", label: "Tiffinity Corporate" },
      { href: "#", label: "Careers" },
      { href: "#", label: "Team" },
    ],
    contact: [
      { href: "#", label: "Terms & Conditions" },
      { href: "#", label: "Cookie Policy" },
      { href: "#", label: "Privacy Policy" },
      { href: "#", label: "Investor Relations" },
    ],
    legal: [
      { href: "#", label: "Partner with us" },
      { href: "#", label: "Ride with us" },
    ],
  };

  return (
    <footer className="bg-tifinnity-green text-white px-4 py-8 md:px-6 md:py-12 relative">
      <div className="rotate-90 absolute right-[-1rem] md:right-0 top-1/2 -translate-y-1/2 hidden md:block">
        <span className="bg-black/80 text-white px-3 py-2 rounded text-sm whitespace-nowrap">
          Help and Support
        </span>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-tifinnity-green" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Tiffinity</h1>
                <p className="text-xs text-gray-300">
                  Cooking smiles, delivering joy.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              © 2025 Tiffinity Limited
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Company</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {footerLinks.contact.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300">Follow us on social media</p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.95.227.47 2.724.313 6.852.055 8.132.04 8.541 0 11.8v.4c.04 3.259.055 3.668.313 4.948  .157 4.128 2.638 6.625 6.74 6.78 1.28.058 1.689.072 4.948.072s3.668-.014 4.948-.072c4.102-.155 6.583-2.652 6.74-6.78 .258-1.28.273-1.689.313-4.948v-.4c-.04-3.259-.055-3.668-.313-4.948-.157-4.128-2.638-6.625-6.74-6.78C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
