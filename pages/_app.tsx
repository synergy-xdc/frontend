import { AppProps } from 'next/app';
import { CustomProvider } from 'rsuite';
import '@/styles/theme.less';
import '@/styles/globals.css';
import "@/styles/Trading.css";


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CustomProvider theme="dark">
      <Component {...pageProps} />
    </CustomProvider>
  );
}

export default MyApp
