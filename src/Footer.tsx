import { Github } from "lucide-react";

function Footer() {
  return (
    <footer className="flex flex-col items-center bg-gray-100 py-8 gap-2">
      <div className="flex gap-2">
        <p>Copyright © 2025</p>
        <a
          className="text-blue-600 hover:text-blue-700"
          target="_blank"
          href="https://www.mehrshadfarahbakhsh.com/"
        >
          Mehrshad Farahbakhsh
        </a>
      </div>
      <a
        className="flex items-center gap-1 text-black"
        target="_blank"
        href="https://github.com/MehrshadFb/SplitMate"
      >
        <Github />
        <span className="hover:text-blue-700">Github</span>
      </a>
    </footer>
  );
}
export default Footer;
