import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import handleLogin from "../Scrape/LoginNode.js";


const SearchComponentIP = () => {
    const [searchValue, setSearchValue] = useState('');
    const [content, setContent] = useState(''); // Thêm state để lưu trữ nội dung trang web
    const [isLoading, setIsLoading] = useState(false); // Thêm state để xác định trạng thái của quá trình kết nối
    const navigate = useNavigate();

    useEffect(() => {
        // Thiết lập giá trị mặc định khi component được tạo ra
        setSearchValue('Nokia');
    }, []); // Mảng truyền vào useEffect để đảm bảo chỉ chạy một lần khi component được tạo ra


    useEffect(() => {
        fetchDataAndDisplay();

        document.getElementById('searchInput').addEventListener('input', function () {
            filterAndDisplay(this.value);
        });

        document.getElementById('userListIP').addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'LI') {
                handleItemClick(target.textContent);
            }
        });
    }, [searchValue]); // Thêm searchValue vào mảng dependency để useEffect chạy mỗi khi searchValue thay đổi

    console.log(searchValue);

    function fetchDataAndDisplay() {
        const apiUrl = getApiUrl(); // Lấy URL dựa vào radio button được chọn
        fetch(apiUrl)
            .then(res => res.json())
            .then(({ data }) => {
                console.log('API data', data);
                displayData(data);
            })
            .catch(error => console.error(error));
    }

    function displayData(data) {
        const userList = document.querySelector('#userListIP');
        userList.innerHTML = ''; // Clear previous content

        data.forEach(({ attributes }) => {
            const markup = `<li>${attributes.NodeName}:${attributes.IPaddress}</li>`;
            userList.insertAdjacentHTML('beforeend', markup);
        });
    }

    function filterAndDisplay(searchValue) {
        const apiUrl = getApiUrl(); // Lấy URL dựa vào radio button được chọn
        fetch(apiUrl)
            .then(res => res.json())
            .then(({ data }) => {
                const filteredData = data.filter(({ attributes }) => attributes.NodeName.includes(searchValue));
                displayData(filteredData);
            })
            .catch(error => console.error(error));
    }

    function handleItemClick(selectedValue) {
        setSearchValue(selectedValue);
    }

    function getApiUrl() {
        // Tùy thuộc vào radio button được chọn, trả về URL tương ứng
        if (searchValue === 'Nokia') {
            return 'http://localhost:1337/api/ypathnames';
        } else if (searchValue === 'Ericsson') {
            return 'http://localhost:1337/api/xpath-names';
        } else {
            // Xử lý tùy chọn khác nếu cần
            return '';
        }
    }

    // Call handleScrape and update content state
    async function handleLoginContent() {
        try {
            // Bắt đầu quá trình kết nối bằng cách đặt isLoading thành true
            setIsLoading(true);
            const LoginContent = await handleLogin(searchValue);
            setContent(LoginContent);
        } catch (error) {
            console.error(error);
        } finally {
            // Kết thúc quá trình kết nối bằng cách đặt isLoading thành false
            setIsLoading(false);
        }
    }

    return (
        <div>
            <h3 className="fs-4 mb-3">Nhập IP</h3>
            <label>
                <input
                    type="radio"
                    value="Nokia"
                    checked={searchValue === 'Nokia'}
                    onChange={() => setSearchValue('Nokia')}
                />
                Nokia
            </label>
            <label>
                <input
                    type="radio"
                    value="Ericsson"
                    checked={searchValue === 'Ericsson'}
                    onChange={() => setSearchValue('Ericsson')}
                />
                Ericsson
            </label>
            {/* Radio button 3 nếu cần */}

            <input
                type="text"
                id="searchInput"
                placeholder="Nhập IP cần tìm"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="customInput"
            />

            <button onClick={handleLoginContent} disabled={isLoading}>
                {isLoading ? 'Connecting...' : 'Connect'}
            </button>
            {/* Hiển thị nội dung trang web */}
            <div dangerouslySetInnerHTML={{ __html: content }}></div>

            <ul id="userListIP"></ul>
        </div>
    );
};

export default SearchComponentIP;


