
const handleLoginWithIP = async (searchValue, setIsLoading) => {
  setIsLoading(true); // Bắt đầu quá trình kết nối

  try {
    const regex = /\b192(?:\.\d{1,3}){3}\b/g;
    const matches = searchValue.match(regex);

    // Lấy kết quả IP
    const IP = matches ? matches[0] : null;
    if (IP) {
      const result = await handleLogin(IP);
      setIsLoading(false); // Kết thúc quá trình kết nối thành công
      return result;
    } else {
      setIsLoading(false); // Kết thúc quá trình kết nối với trạng thái lỗi
      return null;
    }
  } catch (error) {
    console.error(error);
    setIsLoading(false); // Kết thúc quá trình kết nối với trạng thái lỗi
    return null;
  }
};


const handleLogin = async (IP) => {
  try {
    // Gọi API với phương thức POST và lấy dữ liệu từ server
    const response = await fetch('http://localhost:1337/api/crawl-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Các headers khác nếu cần thiết
      },
      body: JSON.stringify({
        searchValue: IP,
        // Thêm các thông tin khác vào body nếu cần
      }),
    });

    // Kiểm tra trạng thái của response
    if (response.ok) {
      // Lấy nội dung của response và chuyển đổi sang JSON
      const data = await response.json();
      // Trích xuất pageTitle từ dữ liệu JSON nhận được
      const pageTitle = data.pageTitle;
      return pageTitle;
    } else {
      console.error('API request failed');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export { handleLoginWithIP, handleLogin };
