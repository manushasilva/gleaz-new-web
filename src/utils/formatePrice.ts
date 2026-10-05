// formate price

export const formatPrice = (price: number) => {
    const hasDecimals = price % 1 !== 0;

    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(price);
  };
  
