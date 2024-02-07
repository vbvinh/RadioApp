import React, { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import { handleScrape } from '../Scrape/Scraping.js';


const SearchComponentSrape = () => {
    const [searchValue, setSearchValue] = useState('');
    const [content, setContent] = useState(''); // Thêm state để lưu trữ nội dung trang web
    const [isTracing, setIsTracing] = useState(false);
    const [opacity, setOpacity] = useState(false);

    useEffect(() => {
        fetchDataAndDisplay();

        document.getElementById('searchInput').addEventListener('input', function () {
            filterAndDisplay(this.value);
        });

        document.getElementById('userListScrape').addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'LI') {
                handleItemClick(target.textContent);
            }
        });
    }, []);

    console.log(searchValue);

    function fetchDataAndDisplay() {
        fetch('http://localhost:1337/api/zpathnames')
            .then(res => res.json())
            .then(({ data }) => {
                console.log('API data', data);
                displayData(data);
            })
            .catch(error => console.error(error));
    }

    function displayData(data) {
        const userList = document.querySelector('#userListScrape');
        userList.innerHTML = ''; // Clear previous content

        data.forEach(({ attributes }) => {
            //const markup = `<li>param: ${attributes.zpath}, xPath: ${attributes.z2path}</li>`;
            const markup = `<li>${attributes.zpath}</li>`;
            userList.insertAdjacentHTML('beforeend', markup);
        });
    }

    function filterAndDisplay(searchValue) {
        fetch('http://localhost:1337/api/zpathnames')
            .then(res => res.json())
            .then(({ data }) => {
                const filteredData = data.filter(({ attributes }) => attributes.zpath.includes(searchValue));
                displayData(filteredData);
            })
            .catch(error => console.error(error));
    }

    function handleItemClick(selectedValue) {
        setSearchValue(selectedValue); // Update the search input value
        //handleScrapeContent(selectedValue); // Thêm dòng này để gọi handleScrapeContent khi item được click
    }

    // Call handleScrape and update content state
    async function handleScrapeContent() {
        //async function handleScrapeContent(selectedValue) {
        try {
            setIsTracing(false);
            const scrapedContent = await handleScrape(searchValue, setIsTracing, setContent);
            setContent(scrapedContent);
        } catch (error) {
            console.error(error);
            setIsTracing(true);
        }
    }
    return (
        <div>
            <h3 className="fs-4 mb-3">Chọn tham số cần tìm</h3>
            <input type="text" id="searchInput" placeholder="Search param" value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="customInput"
            />
            {/* <button onClick={handleScrapeContent}>Trace</button> */}

            <button onClick={handleScrapeContent} disabled={isTracing} class="trace-button">
                {isTracing ? 'Tracing...' : 'Trace'}
                {opacity}
            </button>

            {/* Hiển thị nội dung trang web */}
            <div dangerouslySetInnerHTML={{ __html: content }}></div>

            <ul id="userListScrape"></ul>
        </div>
    );
};

export default SearchComponentSrape;