import {LocaleSelector} from '~/components/LocaleSelector';

export function Layout({children}) {
  return (
    <>
      <header style={{padding: '1rem', backgroundColor: '#f3f3f3'}}>
        <LocaleSelector />
      </header>
      <main>{children}</main>
    </>
  );
}
