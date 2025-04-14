        // Initialize data storage
        let transactions = [];
        let bills = [];
        let totalBalance = 0;
        let monthlyIncome = 0;
        let monthlyExpense = 0;

        // DOM elements
        const pageTitle = document.getElementById('page-title');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const closeSidebar = document.getElementById('close-sidebar');
        const mobileSidebar = document.getElementById('mobile-sidebar');
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        const mobileSidebarItems = document.querySelectorAll('.mobile-nav');
        const pages = document.querySelectorAll('.page');
        const transactionForm = document.getElementById('transaction-form');
        const billForm = document.getElementById('bill-form');
        const filterForm = document.getElementById('filter-form');
        const filterPeriode = document.getElementById('filter-periode');
        const customDateRange = document.getElementById('custom-date-range');
        
        // Toggle sidebar on mobile
        sidebarToggle.addEventListener('click', () => {
            mobileSidebar.classList.remove('-translate-x-full');
        });

        closeSidebar.addEventListener('click', () => {
            mobileSidebar.classList.add('-translate-x-full');
        });

        // Handle page navigation
        function showPage(pageId) {
            pageTitle.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
            
            pages.forEach(page => {
                if (page.id === pageId + '-page') {
                    page.classList.remove('hidden');
                    page.classList.add('active');
                } else {
                    page.classList.add('hidden');
                    page.classList.remove('active');
                }
            });

            // Update sidebar active state
            sidebarItems.forEach(item => {
                if (item.dataset.page === pageId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            mobileSidebarItems.forEach(item => {
                if (item.dataset.page === pageId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            mobileSidebar.classList.add('-translate-x-full');

            // Initialize charts when visiting graph page
            if (pageId === 'grafik') {
                initCharts();
            }
        }

        // Add click event to all sidebar items
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(item.dataset.page);
            });
        });

        mobileSidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(item.dataset.page);
            });
        });

        // Handle transaction form submit
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const jenis = document.querySelector('input[name="jenis-transaksi"]:checked').value;
                const deskripsi = document.getElementById('deskripsi').value;
                const kategori = document.getElementById('kategori').value;
                const jumlah = parseInt(document.getElementById('jumlah').value);
                const tanggal = document.getElementById('tanggal').value;
                
                // Create new transaction
                const transaction = {
                    id: Date.now(),
                    jenis,
                    deskripsi,
                    kategori,
                    jumlah,
                    tanggal,
                    timestamp: new Date().toISOString()
                };
                
                // Add to transactions array
                transactions.push(transaction);
                
                // Update UI
                updateDashboard();
                updateTransactionHistory();
                
                // Reset form
                transactionForm.reset();
                
                // Show alert
                alert('Transaksi berhasil disimpan!');
            });
        }

        // Handle bill form submit
        if (billForm) {
            billForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const nama = document.getElementById('nama-tagihan').value;
                const jumlah = parseInt(document.getElementById('jumlah-tagihan').value);
                const kategori = document.getElementById('kategori-tagihan').value;
                const tanggalJatuhTempo = parseInt(document.getElementById('tanggal-jatuh-tempo').value);
                const pengingat = document.getElementById('pengingat-tagihan').value;
                
                // Create new bill
                const bill = {
                    id: Date.now(),
                    nama,
                    jumlah,
                    kategori,
                    tanggalJatuhTempo,
                    pengingat,
                    status: 'pending', // pending or paid
                    timestamp: new Date().toISOString()
                };
                
                // Add to bills array
                bills.push(bill);
                
                // Update UI
                updateBills();
                updateUpcomingBills();
                
                // Reset form
                billForm.reset();
                
                // Show alert
                alert('Tagihan berkala berhasil disimpan!');
            });
        }

        // Toggle custom date range visibility
        if (filterPeriode) {
            filterPeriode.addEventListener('change', () => {
                if (filterPeriode.value === 'custom') {
                    customDateRange.classList.remove('hidden');
                } else {
                    customDateRange.classList.add('hidden');
                }
            });
        }

        // Handle filter form submit
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get filter values
                const periode = filterPeriode.value;
                const jenis = document.getElementById('filter-jenis').value;
                const kategori = document.getElementById('filter-kategori').value;
                
                // Apply filters and update transaction history
                const filteredTransactions = filterTransactions(periode, jenis, kategori);
                renderTransactionHistory(filteredTransactions);
                
                // Show alert
                alert('Filter diterapkan!');
            });
        }

        // Filter transactions based on criteria
        function filterTransactions(periode, jenis, kategori) {
            let filtered = [...transactions];
            
            // Filter by period
            if (periode !== 'all') {
                const today = new Date();
                let startDate;
                
                switch (periode) {
                    case 'this-month':
                        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                        break;
                    case 'last-month':
                        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                        filtered = filtered.filter(t => {
                            const txDate = new Date(t.tanggal);
                            return txDate >= startDate && txDate <= endDate;
                        });
                        break;
                    case 'last-3-months':
                        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                        break;
                    case 'this-year':
                        startDate = new Date(today.getFullYear(), 0, 1);
                        break;
                    case 'custom':
                        const customStart = document.getElementById('date-start').value;
                        const customEnd = document.getElementById('date-end').value;
                        if (customStart && customEnd) {
                            filtered = filtered.filter(t => {
                                return t.tanggal >= customStart && t.tanggal <= customEnd;
                            });
                        }
                        return filtered;
                }
                
                if (periode !== 'custom' && periode !== 'last-month') {
                    filtered = filtered.filter(t => {
                        const txDate = new Date(t.tanggal);
                        return txDate >= startDate;
                    });
                }
            }
            
            // Filter by type
            if (jenis !== 'all') {
                filtered = filtered.filter(t => t.jenis === jenis);
            }
            
            // Filter by category
            if (kategori !== 'all') {
                filtered = filtered.filter(t => t.kategori === kategori);
            }
            
            return filtered;
        }

        // Update dashboard data
        function updateDashboard() {
            // Calculate totals
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            // Reset monthly totals
            monthlyIncome = 0;
            monthlyExpense = 0;
            totalBalance = 0;
            
            // Calculate new totals
            transactions.forEach(tx => {
                const txDate = new Date(tx.tanggal);
                
                if (tx.jenis === 'pemasukan') {
                    totalBalance += tx.jumlah;
                    
                    if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                        monthlyIncome += tx.jumlah;
                    }
                } else {
                    totalBalance -= tx.jumlah;
                    
                    if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                        monthlyExpense += tx.jumlah;
                    }
                }
            });
            
            // Update UI
            document.getElementById('total-balance').textContent = formatCurrency(totalBalance);
            document.getElementById('monthly-income').textContent = formatCurrency(monthlyIncome);
            document.getElementById('monthly-expense').textContent = formatCurrency(monthlyExpense);
            
            // Update recent transactions in dashboard
            updateRecentTransactions();
        }

        // Update recent transactions in dashboard
        function updateRecentTransactions() {
            const recentTransactionsEl = document.getElementById('recent-transactions');
            
            if (transactions.length === 0) {
                recentTransactionsEl.innerHTML = `
                    <tr>
                        <td colspan="4" class="px-6 py-10 text-center text-gray-500">
                            <i class="fas fa-exchange-alt text-4xl mb-3 opacity-30"></i>
                            <p>Belum ada transaksi</p>
                            <button data-page="transaksi" class="mt-3 text-sm text-indigo-600 hover:text-indigo-800">+ Tambah Transaksi</button>
                        </td>
                    </tr>
                `;
                
                // Add event listener to button
                const addTxButton = recentTransactionsEl.querySelector('button');
                if (addTxButton) {
                    addTxButton.addEventListener('click', () => {
                        showPage('transaksi');
                    });
                }
                return;
            }
            
            // Sort transactions by date (newest first)
            const sortedTransactions = [...transactions].sort((a, b) => {
                return new Date(b.tanggal) - new Date(a.tanggal);
            });
            
            // Get only the 5 most recent transactions
            const recentTransactions = sortedTransactions.slice(0, 5);
            
            // Generate HTML
            let html = '';
            recentTransactions.forEach(tx => {
                html += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-8 w-8 mr-2">
                                    <div class="h-8 w-8 rounded-full flex items-center justify-center ${tx.jenis === 'pemasukan' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                                        <i class="fas ${tx.jenis === 'pemasukan' ? 'fa-arrow-down' : 'fa-arrow-up'} text-xs"></i>
                                    </div>
                                </div>
                                <div>
                                    <div class="text-sm font-medium text-gray-900">${tx.deskripsi}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                ${tx.kategori}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${formatDate(tx.tanggal)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm ${tx.jenis === 'pemasukan' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}">
                            ${tx.jenis === 'pemasukan' ? '+' : '-'} ${formatCurrency(tx.jumlah)}
                        </td>
                    </tr>
                `;
            });
            
            recentTransactionsEl.innerHTML = html;
        }

        // Update full transaction history
        function updateTransactionHistory() {
            const filteredTransactions = filterTransactions(
                document.getElementById('filter-periode').value,
                document.getElementById('filter-jenis').value,
                document.getElementById('filter-kategori').value
            );
            
            renderTransactionHistory(filteredTransactions);
        }

        // Render transaction history based on filtered results
        function renderTransactionHistory(filteredTransactions) {
            const transactionsHistoryEl = document.getElementById('transactions-history');
            
            if (filteredTransactions.length === 0) {
                transactionsHistoryEl.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                            <i class="fas fa-search text-4xl mb-3 opacity-30"></i>
                            <p>Tidak ada transaksi ditemukan</p>
                            <button data-page="transaksi" class="mt-3 text-sm text-indigo-600 hover:text-indigo-800">+ Tambah Transaksi</button>
                        </td>
                    </tr>
                `;
                
                // Add event listener to button
                const addTxButton = transactionsHistoryEl.querySelector('button');
                if (addTxButton) {
                    addTxButton.addEventListener('click', () => {
                        showPage('transaksi');
                    });
                }
                return;
            }
            
            // Sort transactions by date (newest first)
            const sortedTransactions = [...filteredTransactions].sort((a, b) => {
                return new Date(b.tanggal) - new Date(a.tanggal);
            });
            
            // Generate HTML
            let html = '';
            sortedTransactions.forEach(tx => {
                html += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-8 w-8 mr-2">
                                    <div class="h-8 w-8 rounded-full flex items-center justify-center ${tx.jenis === 'pemasukan' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                                        <i class="fas ${tx.jenis === 'pemasukan' ? 'fa-arrow-down' : 'fa-arrow-up'} text-xs"></i>
                                    </div>
                                </div>
                                <div>
                                    <div class="text-sm font-medium text-gray-900">${tx.deskripsi}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                ${tx.kategori}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${formatDate(tx.tanggal)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm ${tx.jenis === 'pemasukan' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}">
                            ${tx.jenis === 'pemasukan' ? '+' : '-'} ${formatCurrency(tx.jumlah)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button class="text-indigo-600 hover:text-indigo-900 mr-2" data-id="${tx.id}" data-action="edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-900" data-id="${tx.id}" data-action="delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            transactionsHistoryEl.innerHTML = html;
            
            // Add event listeners to edit and delete buttons
            const actionButtons = transactionsHistoryEl.querySelectorAll('button[data-action]');
            actionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const id = parseInt(button.dataset.id);
                    const action = button.dataset.action;
                    
                    if (action === 'edit') {
                        editTransaction(id);
                    } else if (action === 'delete') {
                        deleteTransaction(id);
                    }
                });
            });
        }

        // Edit transaction
        function editTransaction(id) {
            const transaction = transactions.find(tx => tx.id === id);
            
            if (!transaction) return;
            
            // To be implemented: Show edit form or modal
            alert('Fitur edit transaksi akan segera hadir!');
        }

        // Delete transaction
        function deleteTransaction(id) {
            if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
                transactions = transactions.filter(tx => tx.id !== id);
                updateDashboard();
                updateTransactionHistory();
                alert('Transaksi berhasil dihapus!');
            }
        }

        // Update bills
        function updateBills() {
            const monthlyBillsEl = document.getElementById('monthly-bills');
            const yearlyBillsSummaryEl = document.getElementById('yearly-bills-summary');
            
            if (bills.length === 0) {
                monthlyBillsEl.innerHTML = `
                    <div class="text-center py-10 text-gray-500">
                        <i class="fas fa-file-invoice text-4xl mb-3 opacity-30"></i>
                        <p>Belum ada tagihan berkala</p>
                    </div>
                `;
                
                yearlyBillsSummaryEl.innerHTML = `
                    <tr>
                        <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                            <i class="fas fa-calendar-alt text-4xl mb-3 opacity-30"></i>
                            <p>Belum ada tagihan berkala yang ditambahkan</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Generate Monthly Bills HTML
            let monthlyHtml = '';
            bills.forEach(bill => {
                const currentDate = new Date();
                const currentDay = currentDate.getDate();
                const daysUntilDue = bill.tanggalJatuhTempo - currentDay;
                let statusClass, statusText, statusBg;
                
                if (bill.status === 'paid') {
                    statusClass = 'bg-green-100 text-green-800';
                    statusText = 'Sudah Lunas';
                    statusBg = 'bg-green-500';
                } else if (daysUntilDue < 0) {
                    statusClass = 'bg-red-100 text-red-800';
                    statusText = 'Terlambat';
                    statusBg = 'bg-red-500';
                } else if (daysUntilDue < 3) {
                    statusClass = 'bg-yellow-100 text-yellow-800';
                    statusText = 'Segera';
                    statusBg = 'bg-yellow-500';
                } else {
                    statusClass = 'bg-blue-100 text-blue-800';
                    statusText = 'Mendatang';
                    statusBg = 'bg-blue-500';
                }
                
                monthlyHtml += `
                    <div class="flex items-center justify-between p-4 border rounded-lg">
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center ${statusBg} text-white mr-4">
                                <i class="fas fa-file-invoice"></i>
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-800">${bill.nama}</h4>
                                <p class="text-sm text-gray-500">${bill.kategori} - Jatuh tempo tanggal ${bill.tanggalJatuhTempo}</p>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <div class="text-gray-800 font-medium mr-4 text-right">
                                <p>${formatCurrency(bill.jumlah)}</p>
                                <span class="px-2 py-1 text-xs rounded-full ${statusClass}">${statusText}</span>
                            </div>
                            <button class="text-gray-400 hover:text-gray-600" data-id="${bill.id}" data-action="toggle-bill">
                                <i class="fas ${bill.status === 'paid' ? 'fa-undo' : 'fa-check'} text-lg"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            // Generate Yearly Summary HTML
            let yearlyHtml = '';
            bills.forEach(bill => {
                yearlyHtml += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="text-sm font-medium text-gray-900">${bill.nama}</div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                ${bill.kategori}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Tanggal ${bill.tanggalJatuhTempo} setiap bulan
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${formatCurrency(bill.jumlah)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${formatCurrency(bill.jumlah * 12)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button class="text-indigo-600 hover:text-indigo-900 mr-2" data-id="${bill.id}" data-action="edit-bill">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-900" data-id="${bill.id}" data-action="delete-bill">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            monthlyBillsEl.innerHTML = monthlyHtml;
            yearlyBillsSummaryEl.innerHTML = yearlyHtml;
            
            // Add event listeners
            const toggleButtons = document.querySelectorAll('button[data-action="toggle-bill"]');
            toggleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const id = parseInt(button.dataset.id);
                    toggleBillStatus(id);
                });
            });
            
            const editButtons = document.querySelectorAll('button[data-action="edit-bill"]');
            editButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const id = parseInt(button.dataset.id);
                    editBill(id);
                });
            });
            
            const deleteButtons = document.querySelectorAll('button[data-action="delete-bill"]');
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const id = parseInt(button.dataset.id);
                    deleteBill(id);
                });
            });
        }

        // Update upcoming bills in dashboard
        function updateUpcomingBills() {
            const upcomingBillsEl = document.getElementById('upcoming-bills');
            
            if (bills.length === 0) {
                upcomingBillsEl.innerHTML = `
                    <div class="text-center py-10 text-gray-500">
                        <i class="fas fa-file-invoice text-4xl mb-3 opacity-30"></i>
                        <p>Belum ada tagihan berkala</p>
                        <button data-page="tagihan" class="mt-3 text-sm text-indigo-600 hover:text-indigo-800">+ Tambah Tagihan</button>
                    </div>
                `;
                
                // Add event listener to button
                const addBillButton = upcomingBillsEl.querySelector('button');
                if (addBillButton) {
                    addBillButton.addEventListener('click', () => {
                        showPage('tagihan');
                    });
                }
                return;
            }
            
            // Sort bills by due date (closest first)
            const sortedBills = [...bills].sort((a, b) => {
                const today = new Date().getDate();
                const aDueInDays = calculateDueInDays(a.tanggalJatuhTempo, today);
                const bDueInDays = calculateDueInDays(b.tanggalJatuhTempo, today);
                return aDueInDays - bDueInDays;
            });
            
            // Filter out paid bills and get only the 3 most urgent bills
            const upcomingBills = sortedBills.filter(bill => bill.status !== 'paid').slice(0, 3);
            
            if (upcomingBills.length === 0) {
                upcomingBillsEl.innerHTML = `
                    <div class="text-center py-10 text-gray-500">
                        <i class="fas fa-check-circle text-4xl mb-3 opacity-30"></i>
                        <p>Semua tagihan sudah lunas!</p>
                    </div>
                `;
                return;
            }
            
            // Generate HTML
            let html = '';
            upcomingBills.forEach(bill => {
                const today = new Date().getDate();
                const dueInDays = calculateDueInDays(bill.tanggalJatuhTempo, today);
                let statusClass, statusBg;
                
                if (dueInDays < 0) {
                    statusClass = 'text-red-600';
                    statusBg = 'bg-red-100';
                } else if (dueInDays < 3) {
                    statusClass = 'text-yellow-600';
                    statusBg = 'bg-yellow-100';
                } else {
                    statusClass = 'text-blue-600';
                    statusBg = 'bg-blue-100';
                }
                
                html += `
                    <div class="flex items-center justify-between p-4 border rounded-lg">
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center ${statusBg} ${statusClass} mr-3">
                                <i class="fas fa-file-invoice"></i>
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-800">${bill.nama}</h4>
                                <p class="text-sm ${statusClass}">
                                    ${dueInDays < 0 ? 'Terlambat ' + Math.abs(dueInDays) + ' hari' : dueInDays === 0 ? 'Jatuh tempo hari ini' : 'Jatuh tempo dalam ' + dueInDays + ' hari'}
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-medium">${formatCurrency(bill.jumlah)}</p>
                            <p class="text-sm text-gray-500">Tanggal ${bill.tanggalJatuhTempo}</p>
                        </div>
                    </div>
                `;
            });
            
            upcomingBillsEl.innerHTML = html;
        }

        // Calculate days until due
        function calculateDueInDays(dueDay, today) {
            if (dueDay >= today) {
                return dueDay - today;
            } else {
                // Calculate days remaining until next month's due date
                const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                return daysInMonth - today + dueDay;
            }
        }

        // Toggle bill payment status
        function toggleBillStatus(id) {
            const billIndex = bills.findIndex(b => b.id === id);
            
            if (billIndex === -1) return;
            
            bills[billIndex].status = bills[billIndex].status === 'paid' ? 'pending' : 'paid';
            
            updateBills();
            updateUpcomingBills();
        }

        // Edit bill
        function editBill(id) {
            const bill = bills.find(b => b.id === id);
            
            if (!bill) return;
            
            // To be implemented: Show edit form or modal
            alert('Fitur edit tagihan akan segera hadir!');
        }

        // Delete bill
        function deleteBill(id) {
            if (confirm('Apakah Anda yakin ingin menghapus tagihan ini?')) {
                bills = bills.filter(b => b.id !== id);
                updateBills();
                updateUpcomingBills();
                alert('Tagihan berhasil dihapus!');
            }
        }

        // Initialize charts
        function initCharts() {
            // Dashboard chart
            initDashboardChart();
            
            // Income vs Expense chart
            initIncomeExpenseChart();
            
            // Category chart
            initCategoryChart();
            
            // Savings chart
            initSavingsChart();
            
            // Budget chart
            initBudgetChart();
        }

        // Initialize dashboard chart
        function initDashboardChart() {
            const ctx = document.getElementById('finance-chart').getContext('2d');
            
            // Generate dummy data
            const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            const incomeData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            const expenseData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            
            transactions.forEach(tx => {
                const txDate = new Date(tx.tanggal);
                const month = txDate.getMonth();
                
                if (tx.jenis === 'pemasukan') {
                    incomeData[month] += tx.jumlah;
                } else {
                    expenseData[month] += tx.jumlah;
                }
            });
            
            // Check if the chart instance already exists
            if (window.financeChart) {
                window.financeChart.destroy();
            }
            
            window.financeChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Pemasukan',
                            data: incomeData,
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 2,
                            tension: 0.4,
                            pointRadius: 4,
                            pointBackgroundColor: 'rgba(16, 185, 129, 1)'
                        },
                        {
                            label: 'Pengeluaran',
                            data: expenseData,
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            borderColor: 'rgba(239, 68, 68, 1)',
                            borderWidth: 2,
                            tension: 0.4,
                            pointRadius: 4,
                            pointBackgroundColor: 'rgba(239, 68, 68, 1)'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += formatCurrency(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatCurrency(value, true);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize income vs expense chart
        function initIncomeExpenseChart() {
            const ctx = document.getElementById('income-expense-chart').getContext('2d');
            
            // Generate dummy data
            const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            const incomeData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            const expenseData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            
            transactions.forEach(tx => {
                const txDate = new Date(tx.tanggal);
                const month = txDate.getMonth();
                
                if (tx.jenis === 'pemasukan') {
                    incomeData[month] += tx.jumlah;
                } else {
                    expenseData[month] += tx.jumlah;
                }
            });
            
            // Check if the chart instance already exists
            if (window.incomeExpenseChart) {
                window.incomeExpenseChart.destroy();
            }
            
            window.incomeExpenseChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Pemasukan',
                            data: incomeData,
                            backgroundColor: 'rgba(79, 70, 229, 0.8)',
                            borderRadius: 6
                        },
                        {
                            label: 'Pengeluaran',
                            data: expenseData,
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += formatCurrency(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatCurrency(value, true);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize category chart
        function initCategoryChart() {
            const ctx = document.getElementById('category-chart').getContext('2d');
            
            // Generate dummy data
            const categories = [
                'Makanan', 
                'Transportasi', 
                'Belanja', 
                'Tagihan', 
                'Hiburan', 
                'Kesehatan', 
                'Pendidikan', 
                'Lainnya'
            ];
            
            // Calculate expense per category
            const categoryData = {};
            categories.forEach(cat => {
                categoryData[cat] = 0;
            });
            
            transactions.forEach(tx => {
                if (tx.jenis === 'pengeluaran' && categoryData[tx.kategori] !== undefined) {
                    categoryData[tx.kategori] += tx.jumlah;
                }
            });
            
            // Check if the chart instance already exists
            if (window.categoryChart) {
                window.categoryChart.destroy();
            }
            
            window.categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: categories,
                    datasets: [{
                        data: categories.map(cat => categoryData[cat]),
                        backgroundColor: [
                            'rgba(79, 70, 229, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(124, 58, 237, 0.8)',
                            'rgba(236, 72, 153, 0.8)',
                            'rgba(6, 182, 212, 0.8)',
                            'rgba(107, 114, 128, 0.8)'
                        ],
                        borderWidth: 0,
                        borderRadius: 6,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    
                                    return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        // Initialize savings chart
        function initSavingsChart() {
            const ctx = document.getElementById('savings-chart').getContext('2d');
            
            // Generate dummy data - cumulative savings over time
            const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            let cumulativeSavings = 0;
            const savingsData = Array(12).fill(0);
            
            // Calculate monthly net income (income - expense)
            const monthlyNetIncome = Array(12).fill(0);
            
            transactions.forEach(tx => {
                const txDate = new Date(tx.tanggal);
                const month = txDate.getMonth();
                
                if (tx.jenis === 'pemasukan') {
                    monthlyNetIncome[month] += tx.jumlah;
                } else {
                    monthlyNetIncome[month] -= tx.jumlah;
                }
            });
            
            // Calculate cumulative savings
            for (let i = 0; i < 12; i++) {
                cumulativeSavings += monthlyNetIncome[i];
                savingsData[i] = cumulativeSavings;
            }
            
            // Check if the chart instance already exists
            if (window.savingsChart) {
                window.savingsChart.destroy();
            }
            
            window.savingsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Tabungan',
                        data: savingsData,
                        backgroundColor: 'rgba(124, 58, 237, 0.2)',
                        borderColor: 'rgba(124, 58, 237, 1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: 'rgba(124, 58, 237, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = 'Tabungan: ';
                                    if (context.parsed.y !== null) {
                                        label += formatCurrency(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return formatCurrency(value, true);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize budget chart
        function initBudgetChart() {
            const ctx = document.getElementById('budget-chart').getContext('2d');
            
            // Set dummy budget values
            const budgetCategories = [
                'Makanan', 
                'Transportasi', 
                'Belanja', 
                'Tagihan', 
                'Hiburan'
            ];
            
            const budgetValues = [2000000, 800000, 1500000, 1200000, 500000];
            
            // Calculate actual spending
            const actualValues = Array(budgetCategories.length).fill(0);
            
            transactions.forEach(tx => {
                if (tx.jenis === 'pengeluaran') {
                    const categoryIndex = budgetCategories.indexOf(tx.kategori);
                    if (categoryIndex !== -1) {
                        actualValues[categoryIndex] += tx.jumlah;
                    }
                }
            });
            
            // Check if the chart instance already exists
            if (window.budgetChart) {
                window.budgetChart.destroy();
            }
            
            window.budgetChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: budgetCategories,
                    datasets: [
                        {
                            label: 'Anggaran',
                            data: budgetValues,
                            backgroundColor: 'rgba(79, 70, 229, 0.7)',
                            borderRadius: 6
                        },
                        {
                            label: 'Aktual',
                            data: actualValues,
                            backgroundColor: 'rgba(239, 68, 68, 0.7)',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += formatCurrency(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatCurrency(value, true);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Format currency
        function formatCurrency(amount, abbreviated = false) {
            if (abbreviated && amount >= 1000000) {
                return 'Rp' + (amount / 1000000).toFixed(1) + ' jt';
            } else if (abbreviated && amount >= 1000) {
                return 'Rp' + (amount / 1000).toFixed(1) + ' rb';
            } else {
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(amount);
            }
        }

        // Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        }

        // Set today's date as default value for date inputs
        document.addEventListener('DOMContentLoaded', function() {
            const today = new Date().toISOString().split('T')[0];
            
            if (document.getElementById('tanggal')) {
                document.getElementById('tanggal').value = today;
            }
            
            if (document.getElementById('date-start')) {
                document.getElementById('date-start').valueAsDate = new Date();
            }
            
            if (document.getElementById('date-end')) {
                document.getElementById('date-end').valueAsDate = new Date();
            }
            
            // Initialize page
            updateDashboard();
            updateBills();
            updateUpcomingBills();
            initCharts();
        });

        // Handle navigation buttons
        document.addEventListener('click', function(e) {
            if (e.target.dataset.page) {
                showPage(e.target.dataset.page);
            }
        });