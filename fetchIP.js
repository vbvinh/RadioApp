import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleLoginWithIP } from '../Scrape/ConnectNode.js';
import ReactDOM from 'react-dom';
import ReactPaginate from 'react-paginate';


const SearchComponentIP = () => {
    const [searchValue, setSearchValue] = useState('');
    const [content, setContent] = useState(''); // Thêm state để lưu trữ nội dung trang web
    const [isLoading, setIsLoading] = useState(false); // Thêm state để xác định trạng thái của quá trình kết nối
    const [buttonState, setButtonState] = useState('Connect');
    //const navigate = useNavigate();
    const [pageNumber, setPageNumber] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const nodesPerPage = 10; // Số lượng node trên mỗi trang
    const [data, setData] = useState([]); // Thêm state để lưu trữ dữ liệu từ API
    const pagesVisited = pageNumber * nodesPerPage;
    //const pagesVisited = Math.min(pageNumber * nodesPerPage, data.length - 1);
    //const pageCount = Math.ceil(data.length / nodesPerPage); // Tính toán số lượng trang
    const displayedData = data.slice(pagesVisited, pagesVisited + nodesPerPage);
    const [selectedRadio, setSelectedRadio] = useState('');

    useEffect(() => {
        // Thiết lập giá trị mặc định khi component được tạo ra
        setSearchValue('');
    }, []); // Mảng truyền vào useEffect để đảm bảo chỉ chạy một lần khi component được tạo ra

    // Hàm xử lý sự kiện khi thay đổi giá trị của radio button
    const handleRadioChange = (event) => {
        const { value } = event.target;
        setSelectedRadio(value); // Cập nhật giá trị của radio button
        setSearchValue(''); // Xóa nội dung ô tìm kiếm
    };

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
    }, [selectedRadio]); // Thêm searchValue vào mảng dependency để useEffect chạy mỗi khi searchValue thay đổi

    console.log(selectedRadio);

    useEffect(() => {
        console.log("Data updated:", data); // Kiểm tra xem data đã được cập nhật chưa
        const pageCount = Math.ceil(data.length / nodesPerPage);
        setTotalPages(pageCount);
    }, [data]); // Tính toán lại số lượng trang khi data thay đổi

    function fetchDataAndDisplay() {
        const apiUrl = getApiUrl(); // Lấy URL dựa vào radio button được chọn
        fetch(apiUrl)
            .then(res => res.json())
            .then(({ data }) => {
                console.log('API data Node', data);
                const nodebAttributes = data.attributes.nodeb;
                const nodeList = Object.values(nodebAttributes).map(node => ({ name: node.name, ip: node.ip }));
                setData(nodeList); // Lưu trữ dữ liệu từ API vào state
            })
            .catch(error => console.error(error));
    }

    function displayData(data) {
        const userList = document.querySelector('#userListIP');
        userList.innerHTML = ''; // Clear previous content

        const nodes = Object.values(data);
        nodes.slice(pagesVisited, pagesVisited + nodesPerPage).forEach((node, index) => {
            const { name, ip } = node;
            const key = `node_${index}`;
            const markup = `<li key=${key}>${name}: ${ip}</li>`;
            userList.insertAdjacentHTML('beforeend', markup);
        });
    }

    function filterAndDisplay(searchValue) {
        const apiUrl = getApiUrl(); // Lấy URL dựa vào radio button được chọn
        fetch(apiUrl)
            .then(res => res.json())
            .then(({ data }) => {
                const nodebAttributes = data.attributes.nodeb;

                // Chuyển đổi searchValue và node.name về cùng một kiểu chữ (ví dụ: chữ thường)
                const lowerSearchValue = searchValue.toLowerCase();

                // Lọc dữ liệu dựa trên searchValue
                const filteredData = Object.values(nodebAttributes).filter(node => {
                    // Chuyển đổi node.name về chữ thường trước khi so sánh
                    const lowerNodeName = node.name.toLowerCase();
                    return lowerNodeName.includes(lowerSearchValue);
                }).map(node => ({ name: node.name, ip: node.ip }));

                // Hiển thị dữ liệu đã lọc
                console.log('Filtered Data: ', filteredData);
                displayData(filteredData);
            })
            .catch(error => console.error(error));
    }


    function handleItemClick(selectedValue) {
        setSearchValue(selectedValue);
    }

    function getApiUrl() {
        // Tùy thuộc vào radio button được chọn, trả về URL tương ứng
        if (selectedRadio === 'CMU-NSN') {
            return 'http://localhost:1337/api/blu-nsns/2';
        } else if (selectedRadio === 'BLU-NSN') {
            return 'http://localhost:1337/api/blu-nsns/1';
        } else if (selectedRadio === 'CTO-ERI') {
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
            setButtonState('Connecting');

            const LoginContent = await handleLoginWithIP(searchValue, setIsLoading, setContent);
            setContent(LoginContent);
        } catch (error) {
            console.error(error);
        } finally {
            // Kết thúc quá trình kết nối bằng cách đặt isLoading thành false
            setIsLoading(false);
            setButtonState('Disconnect');
        }
    }

    function displayDataPerPage() {
        if (displayedData.length === 0) {
            return null; // Hoặc bạn có thể trả về một thông báo nếu data chưa được lấy
        }

        return displayedData
            .slice(pagesVisited, pagesVisited + nodesPerPage)
            .map((node, index) => {
                const { name, ip } = node;
                const key = `node_${index}`;
                return <li key={key}>{name}: {ip}</li>;
            });
    }

    const handlePageChange = ({ selected }) => {
        setPageNumber(selected);
    };

    return (

        <div>
            <h3 className="fs-4 mb-3">Tìm trạm hoặc nhập IP</h3>
            <div className="radio-container">
                <label>
                    <input
                        type="radio"
                        value="CMU-NSN"
                        checked={selectedRadio === 'CMU-NSN'}
                        onChange={handleRadioChange} // Sử dụng onChange thay vì onClick
                    />
                    CMU-NSN
                </label>
                <label>
                    <input
                        type="radio"
                        value="BLU-NSN"
                        checked={selectedRadio === 'BLU-NSN'}
                        onChange={handleRadioChange} // Sử dụng onChange thay vì onClick
                    />
                    BLU-NSN
                </label>
                <label>
                    <input
                        type="radio"
                        value="CTO-ERI"
                        checked={selectedRadio === 'CTO-ERI'}
                        onChange={handleRadioChange} // Sử dụng onChange thay vì onClick
                    />
                    CTO-ERICSSON
                </label>
            </div>
            <input
                type="text" id="searchInput" placeholder="Tìm trạm hoặc nhập IP" value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="customInput"
            />
            <ul id="userListIP">{displayDataPerPage()}</ul>

            <ReactPaginate
                breakLabel="..."
                previousLabel={'Previous'}
                nextLabel={'Next'}
                pageCount={totalPages}
                onPageChange={handlePageChange}
                containerClassName={'pagination'}
                activeClassName={'active'}
            />

            {/* <button onClick={handleLoginContent} disabled={isLoading} className="connect-button">
                {isLoading ? 'Connecting...' : buttonState}
            </button> */}

            <button onClick={handleLoginContent} disabled={isLoading} class="connect-button">
                {isLoading ? 'Connecting...' : 'Connect/Disconnect'}
            </button>

            {/* <button onClick={handleLoginContent} class="disconnect-button">
                {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </button> */}

            {/* Hiển thị nội dung trang web */}
            <div dangerouslySetInnerHTML={{ __html: content }}></div>

            {/* <ul id="userListIP"></ul> */}
        </div>
    );
};

export default SearchComponentIP;


