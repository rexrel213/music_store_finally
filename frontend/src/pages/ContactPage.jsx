import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center font-['Playfair_Display']">
        Контакты
      </h1>

      <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
        <div className="flex items-center space-x-4">
          <MapPin className="h-6 w-6 text-indigo-600" />
          <p className="text-gray-700 text-lg">
            г. Ижевск, ул. Карла Маркса, 244
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Phone className="h-6 w-6 text-indigo-600" />
          <p className="text-gray-700 text-lg">+7 (3412) 123-456</p>
        </div>

        <div className="flex items-center space-x-4">
          <Mail className="h-6 w-6 text-indigo-600" />
          <p className="text-gray-700 text-lg">infoHarmony@gmail.com</p>
        </div>

        <div className="mt-8 rounded-lg overflow-hidden shadow-lg">
        <iframe
            title="google-map"
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d545.4147871093593!2d53.20623837927592!3d56.85179027266053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sru!2sde!4v1749912871393!5m2!1sru!2sde"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
