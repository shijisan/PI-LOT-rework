import { Poppins, Roboto_Flex } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const robotoFlex = Roboto_Flex({
  weight: "variable",
  subsets: ["latin"],
});

export const metadata = {
  title: "PI.LOT",
  description: "Your business automation hub!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${robotoFlex.className} antialiased`}
      >
        <Nav />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
