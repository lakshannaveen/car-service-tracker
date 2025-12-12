export const formatNumberWithCommas = (value: number): string => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const parseFormattedNumber = (formattedValue: string): number => {
  return parseFloat(formattedValue.replace(/,/g, "")) || 0
}

export const formatCost = (cost: number): string => {
  return formatNumberWithCommas(cost)
}
