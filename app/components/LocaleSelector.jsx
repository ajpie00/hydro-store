export function LocaleSelector() {
  const handleChange = (e) => {
    const locale = e.target.value;
    const path = window.location.pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?/, '').replace(/^\/+/, '');
    window.location.href = `/${locale}/${path || ''}`;
  };

  return (
    <form style={{marginBottom: '1rem', padding: '1rem', border: '2px dashed red', width: 'fit-content'}}>
      <label htmlFor="locale" style={{marginRight: '0.5rem'}}>🌐 Dil Seç:</label>
      <select
        id="locale"
        onChange={handleChange}
        defaultValue={window.location.pathname.split('/')[1]}
      >
        <option value="en">English (USD)</option>
        <option value="tr">Türkçe (TRY)</option>
        <option value="de">Deutsch (EUR)</option>
      </select>
    </form>
  );
}
