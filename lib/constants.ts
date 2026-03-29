export const productCategoryLabels = {
  DRINK: "Bebidas",
  MAIN: "Platos",
  SIDE: "Acompañamientos",
  DESSERT: "Postres",
  OTHER: "Otros",
} as const;

export const orderReferenceLabels = {
  TABLE: "Mesa",
  NUMBER: "Número",
} as const;

export const preparationStatusLabels = {
  PENDING: "Pendiente",
  READY: "Listo",
} as const;

export const paymentStatusLabels = {
  PENDING: "Pendiente",
  PAID: "Pagado",
} as const;

export const paymentMethodLabels = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  DEBIT: "Débito",
  CREDIT: "Crédito",
  OTHER: "Otro",
} as const;

export const productCategories = Object.entries(productCategoryLabels).map(
  ([value, label]) => ({ value, label }),
);

export const paymentMethods = Object.entries(paymentMethodLabels).map(
  ([value, label]) => ({ value, label }),
);
