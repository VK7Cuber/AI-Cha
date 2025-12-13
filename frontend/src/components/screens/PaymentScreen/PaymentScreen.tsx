import { useNavigate } from 'react-router-dom';

function PaymentScreen() {
  const navigate = useNavigate();

  const handlePay = () => {
    setTimeout(() => navigate('/rating'), 500);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 bg-white px-6 py-8">
      <header className="flex items-center justify-between">
        <div className="text-3xl font-bold text-[#D32F2F]">Оплата заказа</div>
        <button type="button" onClick={() => navigate(-1)} className="text-lg font-semibold text-[#757575] underline">
          Назад
        </button>
      </header>

      <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#fff8f6] p-4 shadow-sm">
        <div className="text-xl font-semibold text-[#212121]">Сумма: 0 ₽</div>
        <div className="text-[#757575]">Номер заказа появится после интеграции API</div>
      </div>

      <div className="flex flex-col gap-4">
        {['Банковская карта', 'AI Cha карта', 'Оплата по СБП'].map((method) => (
          <button
            key={method}
            type="button"
            onClick={handlePay}
            className="w-full rounded-2xl bg-white px-6 py-5 text-left text-xl font-semibold text-[#212121] shadow-lg ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-98"
          >
            {method}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PaymentScreen;

