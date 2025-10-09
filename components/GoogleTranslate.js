"use client";
import { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    const addScript = document.createElement("script");
    addScript.type = "text/javascript";
    addScript.async = true;
    addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(addScript);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({ pageLanguage: "en" }, "google_translate_element");
    };
  }, []);

  return <div id="google_translate_element" />;
};

export default GoogleTranslate;
