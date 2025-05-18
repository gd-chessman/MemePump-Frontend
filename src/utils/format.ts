export const truncateString = (str: string | null | undefined, maxLength: number): string => {
    // Kiểm tra nếu str là null, undefined hoặc chuỗi rỗng
    if (!str || str.length === 0) {
      return '';  // Hoặc trả về một giá trị mặc định khác tùy nhu cầu
    }
  
    // Nếu độ dài của str nhỏ hơn hoặc bằng maxLength, trả về str nguyên vẹn
    if (str.length <= maxLength) {
      return str;
    }
  
    // Nếu str dài hơn maxLength, cắt chuỗi và thêm "..." vào giữa
    const halfLength = Math.floor(maxLength / 2) - 1;
    return str.slice(0, halfLength) + "..." + str.slice(str.length - halfLength);
  };
  
export const formatNumberWithSuffix = (input: number | string): string => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num)) {
    return '0';
  }

  const formatNumber = (n: number) => {
    const absNum = Math.abs(n);
    return n?.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: absNum < 0.01 ? 6 : 2
    });
  };

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1000000000000000) {
    return sign + '+>' + formatNumber(absNum / 1000000000000) + 'T';
  }
  if (absNum >= 1000000000000) {
    return sign + formatNumber(absNum / 1000000000000) + 'T';
  }
  if (absNum >= 1000000000) {
    return sign + formatNumber(absNum / 1000000000) + 'B';
  }
  if (absNum >= 1000000) {
    return sign + formatNumber(absNum / 1000000) + 'M';
  }
  if (absNum >= 1000) {
    return sign + formatNumber(absNum / 1000) + 'K';
  }
  return formatNumber(num);
};
  
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      return '';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
  

export const formatNumberWithSuffix3 = (input: number | string): string => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num)) {
    return '0';
  }

  const formatNumber = (n: number) => {
    const absNum = Math.abs(n);
    return n?.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: absNum < 0.01 ? 6 : 3
    });
  };

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1000000000000000) {
    return sign + '+>' + formatNumber(absNum / 1000000000000) + 'T';
  }
  if (absNum >= 1000000000000) {
    return sign + formatNumber(absNum / 1000000000000) + 'T';
  }
  if (absNum >= 1000000000) {
    return sign + formatNumber(absNum / 1000000000) + 'B';
  }
  if (absNum >= 1000000) {
    return sign + formatNumber(absNum / 1000000) + 'M';
  }
  if (absNum >= 1000) {
    return sign + formatNumber(absNum / 1000) + 'K';
  }
  return formatNumber(num);
};

export const formatNumberWithSuffix3Hidden = (input: number | string): string => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num)) {
    return '0';
  }

  const formatNumber = (n: number) => {
    const absNum = Math.abs(n);
    // Làm tròn đến 3 chữ số thập phân
    const rounded = n?.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: absNum < 0.01 ? 6 : 3
    });
    
    // Nếu có phần thập phân, ẩn số cuối cùng
    if (rounded.includes('.')) {
      const parts = rounded.split('.');
      if (parts[1].length > 0) {
        parts[1] = parts[1].slice(0, -1);
        return parts.join('.');
      }
    }
    return rounded;
  };

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1000000000000000) {
    return sign + '+>' + formatNumber(absNum / 1000000000000) + 'T';
  }
  if (absNum >= 1000000000000) {
    return sign + formatNumber(absNum / 1000000000000) + 'T';
  }
  if (absNum >= 1000000000) {
    return sign + formatNumber(absNum / 1000000000) + 'B';
  }
  if (absNum >= 1000000) {
    return sign + formatNumber(absNum / 1000000) + 'M';
  }
  if (absNum >= 1000) {
    return sign + formatNumber(absNum / 1000) + 'K';
  }
  return formatNumber(num);
};