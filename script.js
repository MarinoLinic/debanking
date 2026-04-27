// --- Quote Carousel Logic ---
			const quotes = [
				{
					text: 'Debanking for political speech is clearly a human rights issue, but it has never, not once, been tried as such by the entire human rights NGO world.',
					author: 'Erik Haalo (X)',
					url: 'https://x.com/Erik_Hamre/status/1998674420680823064',
				},
				{
					text: "You literally can't get a bank account. You can't get a visa terminal. You can't process transactions. You can't do payroll. You can't do direct deposit. You can't get insurance. You've been sanctioned. And then [the Biden] administration extended that concept to apply to tech founders, crypto founders, and political opponents.",
					author: 'Marc Andreessen on Operation Chokepoint 2.0',
					url: 'https://x.com/BasedTorba/status/1861786736315019752',
				},
			]

			let slideIndex = 0
			let carouselTimer

			function initCarousel() {
				const container = document.getElementById('quoteSlides')
				container.innerHTML = quotes
					.map(
						(q, index) => `
					<div class="quote-slide ${index === 0 ? 'active' : ''}">
						<div class="quote-text"><p>${q.text}</p></div>
						<a href="${q.url}" target="_blank" class="quote-source">— ${q.author}</a>
					</div>
				`
					)
					.join('')
				startCarousel()
			}

			function showSlide(n) {
				const slides = document.getElementsByClassName('quote-slide')
				if (n >= slides.length) slideIndex = 0
				if (n < 0) slideIndex = slides.length - 1

				for (let i = 0; i < slides.length; i++) {
					slides[i].classList.remove('active')
				}
				slides[slideIndex].classList.add('active')
			}

			function moveSlide(n) {
				showSlide((slideIndex += n))
			}

			function startCarousel() {
				carouselTimer = setInterval(() => {
					moveSlide(1)
				}, 1000000) // 1000 seconds
			}

			function pauseCarousel() {
				clearInterval(carouselTimer)
			}

			function resumeCarousel() {
				startCarousel()
			}

			function toggleQuote() {
				const container = document.getElementById('quoteContainer')
				const btn = document.getElementById('quoteToggleBtn')
				container.classList.toggle('hidden')
				if (container.classList.contains('hidden')) {
					btn.innerText = 'Show Quote Context'
				} else {
					btn.innerText = 'Hide Quote Context'
				}
			}

			// --- Main Data Logic ---

			let debankingData = []
			let alternativesData = []
			let sourcesMap = {}
			let globalSources = {}
			let currentTab = 'debanking'
			let currentLayout = 'grid' // 'grid', 'list', 'table'

			let filters = {
				person: null,
				type: null,
				country: null,
				search: null,
			}

			// Sorting State
			let sortState = {
				key: null,
				direction: 'asc', // or 'desc'
			}

			document.addEventListener('DOMContentLoaded', () => {
				initCarousel()

				// Ensure correct layout on mobile load if needed
				if (window.innerWidth <= 768 && currentLayout === 'table') {
					currentLayout = 'grid' // Default fallback
				}

				Promise.all([
					fetch('debanking.json').then((res) => res.json()),
					fetch('debanking_alternatives.json').then((res) => res.json()),
					fetch('sources.json').then((res) => res.json()),
				])
					.then(([debanking, alternatives, sources]) => {
						sources.forEach((src) => {
							if (src.entity === '*') {
								globalSources[src.person] = src.url
							} else {
								sourcesMap[`${src.entity}|${src.person}`] = src.url
							}
						})

						debankingData = debanking.sort((a, b) => {
							const countA = a.people ? a.people.length : 0
							const countB = b.people ? b.people.length : 0
							return countB - countA
						})

						alternativesData = alternatives
						populateDropdowns()
						render()
					})
					.catch((err) => {
						console.error(err)
						document.getElementById(
							'contentArea'
						).innerHTML = `<div style="text-align:center; color: var(--accent-red); grid-column: 1/-1;">
                        Error loading data. Please ensure JSON files are present and you are using a local server (CORS).
                    </div>`
					})
			})

			function getMonogram(name) {
				if (!name) return '?'
				const parts = name.split(' ')
				if (parts.length > 1) {
					return (parts[0][0] + parts[1][0]).toUpperCase()
				}
				return name.substring(0, 2).toUpperCase()
			}

			function getFlagHtml(country) {
				if (!country) return `<img src="https://flagcdn.com/w40/un.png" class="flag-img" alt="Global">`
				const cleanName = country.split('/')[0].trim().toLowerCase()
				// Mapping map remains the same
				const isoMap = {
					austria: 'at',
					australia: 'au',
					germany: 'de',
					greece: 'gr',
					croatia: 'hr',
					usa: 'us',
					uk: 'gb',
					slovakia: 'sk',
					hungary: 'hu',
					poland: 'pl',
					'czech republic': 'cz',
					france: 'fr',
					russia: 'ru',
					switzerland: 'ch',
					turkey: 'tr',
					malta: 'mt',
					netherlands: 'nl',
					lithuania: 'lt',
					luxembourg: 'lu',
					finland: 'fi',
					gibraltar: 'gi',
					ireland: 'ie',
					singapore: 'sg',
					bvi: 'vg',
					'hong kong': 'hk',
					uae: 'ae',
					canada: 'ca',
					romania: 'ro',
					spain: 'es',
					iceland: 'is',
					europe: 'eu',
					global: 'un',
					ukraine: 'ua',
					estonia: 'ee',
					latvia: 'lv',
					sweden: 'se',
					uae: 'ae',
					portugal: 'pt'
				}

				const code = isoMap[cleanName]
				return code
					? `<img src="https://flagcdn.com/w40/${code}.png" class="flag-img" alt="${country}">`
					: `<img src="https://flagcdn.com/w40/un.png" class="flag-img" alt="Global">`
			}

			// Modified to accept a size class or style
			function renderIconHtml(item, isSmall = false) {
				const monogram = getMonogram(item.name)
				const wrapperClass = isSmall ? 'list-icon-wrapper' : 'icon-wrapper'

				let content
				if (item.url) {
					content = `
                    <img src="https://www.google.com/s2/favicons?domain=${item.url}&sz=64" 
                         class="entity-img" 
                         alt="${item.name}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div class="entity-icon" style="display:none">${monogram}</div>
                `
				} else {
					content = `<div class="entity-icon">${monogram}</div>`
				}

				if (item.url) {
					return `<a href="${item.url}" target="_blank" class="${wrapperClass}" title="Go to ${item.name}">${content}</a>`
				} else {
					return `<div class="${wrapperClass}">${content}</div>`
				}
			}

			function renderPeopleHtml(item) {
				if (!item.people || item.people.length === 0) return ''

				return item.people
					.map((p) => {
						const sourceUrl = sourcesMap[`${item.name}|${p}`] || globalSources[p]
						const linkHtml = sourceUrl
							? `<a href="${sourceUrl}" target="_blank" class="source-link" title="View Source for ${p}" onclick="event.stopPropagation();">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
								<polyline points="15 3 21 3 21 9"></polyline>
								<line x1="10" y1="14" x2="21" y2="3"></line>
							</svg>
						   </a>`
							: ''
						return `<span class="person-tag" onclick="addFilter('person', '${p}')">${p}${linkHtml}</span>`
					})
					.join('')
			}

			function populateDropdowns() {
				const countrySet = new Set()
				const typeSet = new Set()
				const personSet = new Set()

				;[...debankingData, ...alternativesData].forEach((item) => {
					if (item.name && item.name.startsWith('None identified')) return
					if (item.type) typeSet.add(item.type)
					if (item.country) {
						const parts = item.country.split('/')
						parts.forEach((p) => countrySet.add(p.trim()))
					}
				})

				debankingData.forEach((item) => {
					if (item.people && Array.isArray(item.people)) {
						item.people.forEach((p) => personSet.add(p))
					}
				})

				const countrySelect = document.getElementById('countrySelect')
				const typeSelect = document.getElementById('typeSelect')
				const personSelect = document.getElementById('personSelect')

				Array.from(countrySet)
					.sort()
					.forEach((c) => countrySelect.appendChild(createOption(c)))
				Array.from(typeSet)
					.sort()
					.forEach((t) => typeSelect.appendChild(createOption(t)))
				Array.from(personSet)
					.sort()
					.forEach((p) => personSelect.appendChild(createOption(p)))
			}

			function createOption(val) {
				const opt = document.createElement('option')
				opt.value = val
				opt.innerText = val
				return opt
			}

			// --- Logic Switchers ---

			function switchTab(tab) {
				currentTab = tab

				// Reset sort when switching tabs
				sortState = { key: null, direction: 'asc' }

				document.querySelectorAll('.tab-btn').forEach((btn) => {
					btn.classList.remove('active')
				})
				document.getElementById(`tab-${tab}`).classList.add('active')

				clearAllFilters()
			}

			function switchLayout(layout) {
				currentLayout = layout
				document.querySelectorAll('.layout-btn').forEach((btn) => {
					btn.classList.toggle('active', btn.id === `btn-${layout}`)
				})

				const contentArea = document.getElementById('contentArea')
				contentArea.className = ''
				if (layout === 'grid') contentArea.classList.add('grid-view')

				render()
			}

			function handleSort(key) {
				if (sortState.key === key) {
					// Toggle direction
					sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc'
				} else {
					sortState.key = key
					sortState.direction = 'asc'
				}
				render()
			}

			function addFilter(key, value) {
				if (!value) return
				filters[key] = value
				if (key === 'country') document.getElementById('countrySelect').value = value
				if (key === 'type') document.getElementById('typeSelect').value = value
				if (key === 'person') document.getElementById('personSelect').value = value
				render()
			}

			function removeFilter(key) {
				filters[key] = null
				if (key === 'country') document.getElementById('countrySelect').value = ''
				if (key === 'type') document.getElementById('typeSelect').value = ''
				if (key === 'person') document.getElementById('personSelect').value = ''
				render()
			}

			function handleSearch(val) {
				filters.search = val ? val.toLowerCase() : null
				render()
			}

			function clearAllFilters() {
				filters = { person: null, type: null, country: null, search: null }
				document.getElementById('countrySelect').value = ''
				document.getElementById('typeSelect').value = ''
				document.getElementById('personSelect').value = ''
				document.getElementById('searchInput').value = ''
				render()
			}

			function togglePeopleList(id) {
				const el = document.getElementById(id)
				if (el) {
					if (el.style.display === 'none') {
						el.style.display = 'block'
					} else {
						el.style.display = 'none'
					}
				}
			}

			// --- Render Logic ---

			function render() {
				const contentArea = document.getElementById('contentArea')
				const filterContainer = document.getElementById('activeFilters')
				const clearBtn = document.getElementById('clearBtn')
				const resultsCount = document.getElementById('resultsCount')

				filterContainer.innerHTML = ''
				contentArea.innerHTML = ''

				let hasFilters = false
				const dropdownKeys = ['person', 'type', 'country']
				dropdownKeys.forEach((key) => {
					if (filters[key]) {
						hasFilters = true
						const badge = document.createElement('div')
						badge.className = 'filter-badge'
						let label = key === 'person' ? 'Target' : key.charAt(0).toUpperCase() + key.slice(1)
						badge.innerHTML = `<span>${label}: ${filters[key]}</span> <button onclick="removeFilter('${key}')">×</button>`
						filterContainer.appendChild(badge)
					}
				})
				if (filters.search) hasFilters = true
				clearBtn.style.display = hasFilters ? 'block' : 'none'

				const sourceData = currentTab === 'debanking' ? debankingData : alternativesData

				let filteredData = sourceData.filter((item) => {
					if (item.name && item.name.startsWith('None identified')) return false
					if (filters.country && (!item.country || !item.country.includes(filters.country))) return false
					if (filters.type && item.type !== filters.type) return false
					if (filters.person && (!item.people || !item.people.includes(filters.person))) return false

					if (filters.search) {
						const s = filters.search
						const matchName = item.name?.toLowerCase().includes(s)
						const matchDesc = item.description?.toLowerCase().includes(s)
						const matchPeople = item.people?.some((p) => p.toLowerCase().includes(s))
						const matchCountry = item.country?.toLowerCase().includes(s)
						if (!matchName && !matchDesc && !matchPeople && !matchCountry) return false
					}
					return true
				})

				// Sorting Logic
				if (sortState.key) {
					filteredData.sort((a, b) => {
						let valA = a[sortState.key]
						let valB = b[sortState.key]

						// Handle array lengths for people count sorting?
						if (sortState.key === 'people') {
							valA = a.people ? a.people.length : 0
							valB = b.people ? b.people.length : 0
						} else {
							// String comparison
							if (valA) valA = valA.toString().toLowerCase()
							if (valB) valB = valB.toString().toLowerCase()
						}

						if (valA < valB) return sortState.direction === 'asc' ? -1 : 1
						if (valA > valB) return sortState.direction === 'asc' ? 1 : -1
						return 0
					})
				}

				resultsCount.innerText = `Showing ${filteredData.length} ${filteredData.length === 1 ? 'item' : 'items'}`

				if (filteredData.length === 0) {
					contentArea.innerHTML = `<div style="text-align:center; color: var(--text-muted); grid-column: 1/-1; padding-top: 40px;">No results found for these filters.</div>`
					return
				}

				if (currentLayout === 'grid') {
					renderGrid(filteredData, contentArea)
				} else if (currentLayout === 'list') {
					renderList(filteredData, contentArea)
				} else if (currentLayout === 'table') {
					renderTable(filteredData, contentArea)
				}
			}

			// 1. Grid Renderer
			function renderGrid(data, container) {
				data.forEach((item) => {
					const card = document.createElement('div')
					card.className = 'card'
					if (currentTab === 'debanking') {
						renderDebankingCard(card, item)
					} else {
						renderAlternativeCard(card, item)
					}
					container.appendChild(card)
				})
			}

			function renderDebankingCard(card, item) {
				const isRecent = item.year_last && item.year_last >= 2023
				const flagHtml = getFlagHtml(item.country)
				const iconHtml = renderIconHtml(item)
				let peopleHtml = ''
				if (item.people && item.people.length > 0) {
					peopleHtml = `
                <div class="people-section">
                    <span class="people-label">Targeted (${item.people.length}):</span>
                    <div class="people-tags">${renderPeopleHtml(item)}</div>
                </div>`
				}

				card.innerHTML = `
				<div class="status-badge red">Debanked</div>
                <div class="card-top-row">
                    ${iconHtml}
                    <div class="entity-info">
                        <div class="entity-name">
							${item.url ? `<a href="${item.url}" target="_blank">${item.name}</a>` : item.name}
						</div>
                        ${
													item.year_last
														? `<span class="year-badge ${isRecent ? 'recent' : ''}">Last Incident: ${
																item.year_last
														  }</span>`
														: ''
												}
                    </div>
                </div>
                <div class="meta-tags">
                    <span class="tag tag-type" onclick="addFilter('type', '${item.type}')">${item.type}</span>
                    <span class="tag tag-country" onclick="addFilter('country', '${item.country}')">${flagHtml} ${
					item.country
				}</span>
                </div>
                <div class="description">${item.description}</div>
                ${peopleHtml}
            `
			}

			function renderAlternativeCard(card, item) {
				const flagHtml = getFlagHtml(item.country)
				const iconHtml = renderIconHtml(item)
				let statusClass = 'status-neutral'
				if (
					item.verification_status?.toLowerCase().includes('guarantee') ||
					item.verification_status?.toLowerCase().includes('proven')
				) {
					statusClass = 'status-verified'
				} else if (item.verification_status?.toLowerCase().includes('unverified')) {
					statusClass = 'status-unverified'
				}

				card.innerHTML = `
                 <div class="card-top-row">
                    ${iconHtml}
                    <div class="entity-info">
                        <div class="entity-name">
							${item.url ? `<a href="${item.url}" target="_blank">${item.name}</a>` : item.name}
						</div>
                    </div>
                </div>
                <div class="meta-tags">
                    <span class="tag tag-type" onclick="addFilter('type', '${item.type}')">${item.type}</span>
                    ${
											item.country
												? `<span class="tag tag-country" onclick="addFilter('country', '${item.country}')">${flagHtml} ${item.country}</span>`
												: ''
										}
                </div>
                <div class="description">${item.description}</div>
                <div style="margin-top:auto">
                    ${
											item.verification_status
												? `<span class="verification-badge ${statusClass}">${item.verification_status}</span>`
												: ''
										}
                    ${item.url ? `<a href="${item.url}" target="_blank" class="alt-link">Visit Website &rarr;</a>` : ''}
                </div>
            `
			}

			// 2. List Renderer
			function renderList(data, container) {
				const wrapper = document.createElement('div')
				wrapper.className = 'list-view-container'

				// Group by Type
				const grouped = data.reduce((acc, item) => {
					const t = item.type || 'Other'
					if (!acc[t]) acc[t] = []
					acc[t].push(item)
					return acc
				}, {})

				const sortedKeys = Object.keys(grouped).sort()

				sortedKeys.forEach((type, groupIndex) => {
					const groupDiv = document.createElement('div')
					groupDiv.className = 'list-group'
					groupDiv.innerHTML = `<h3>${type}</h3>`

					const ul = document.createElement('div')

					grouped[type].forEach((item, itemIndex) => {
						const flag = getFlagHtml(item.country)
						// Use renderIconHtml with isSmall=true
						const iconHtml = renderIconHtml(item, true)

						const row = document.createElement('div')
						row.className = 'list-item'

						let details = ''
						let expandHtml = ''

						if (currentTab === 'debanking') {
							const peopleCount = item.people ? item.people.length : 0
							if (peopleCount > 0) {
								const uniqueId = `targeted-list-${groupIndex}-${itemIndex}`
								const peopleListHtml = renderPeopleHtml(item)

								details = `
									<div class="list-meta-row">
										<button class="targeted-trigger" onclick="togglePeopleList('${uniqueId}')">Targeted: ${peopleCount} people</button>
									</div>
								`
								expandHtml = `<div id="${uniqueId}" class="targeted-expanded" style="display:none">
									<div class="people-tags">${peopleListHtml}</div>
								</div>`
							}
						} else {
							if (item.verification_status) {
								details = `<div class="list-meta-row"><small style="color:var(--text-muted)">Status: ${item.verification_status}</small></div>`
							}
						}

						row.innerHTML = `
							<div class="list-item-header">
								${iconHtml}
								${
									item.url
										? `<a href="${item.url}" target="_blank" style="text-decoration:none; color:inherit;">${item.name}</a>`
										: `<span>${item.name}</span>`
								}
								<span class="tag tag-country" style="margin-left:auto; font-size:0.7rem;" onclick="addFilter('country', '${
									item.country
								}')">${flag} ${item.country || 'Global'}</span>
							</div>
							<div class="list-item-details">
								<div>${item.description}</div>
								${details}
								${expandHtml}
							</div>
						`
						ul.appendChild(row)
					})

					groupDiv.appendChild(ul)
					wrapper.appendChild(groupDiv)
				})

				container.appendChild(wrapper)
			}

			// 3. Table Renderer
			function renderTable(data, container) {
				const wrapper = document.createElement('div')
				wrapper.className = 'table-responsive'

				const table = document.createElement('table')
				table.className = 'data-table'

				const getSortIndicator = (key) => {
					if (sortState.key === key) {
						return sortState.direction === 'asc' ? '▲' : '▼'
					}
					return ''
				}

				let thead = ''
				if (currentTab === 'debanking') {
					thead = `<thead>
						<tr>
							<th style="width:250px;" onclick="handleSort('name')">Name <span class="sort-indicator">${getSortIndicator(
								'name'
							)}</span></th>
							<th onclick="handleSort('type')">Type <span class="sort-indicator">${getSortIndicator('type')}</span></th>
							<th onclick="handleSort('country')">Country <span class="sort-indicator">${getSortIndicator('country')}</span></th>
							<th onclick="handleSort('year_last')">Last Incident <span class="sort-indicator">${getSortIndicator(
								'year_last'
							)}</span></th>
							<th onclick="handleSort('people')">People Targeted <span class="sort-indicator">${getSortIndicator(
								'people'
							)}</span></th>
						</tr>
					</thead>`
				} else {
					thead = `<thead>
						<tr>
							<th style="width:250px;" onclick="handleSort('name')">Name <span class="sort-indicator">${getSortIndicator(
								'name'
							)}</span></th>
							<th onclick="handleSort('type')">Type <span class="sort-indicator">${getSortIndicator('type')}</span></th>
							<th onclick="handleSort('country')">Country <span class="sort-indicator">${getSortIndicator('country')}</span></th>
							<th onclick="handleSort('verification_status')">Status <span class="sort-indicator">${getSortIndicator(
								'verification_status'
							)}</span></th>
							<th>Link</th>
						</tr>
					</thead>`
				}

				const tbody = document.createElement('tbody')

				data.forEach((item) => {
					const tr = document.createElement('tr')
					const icon = renderIconHtml(item, true) // Small icon
					const flag = getFlagHtml(item.country)

					if (currentTab === 'debanking') {
						const peopleLinks =
							item.people && item.people.length > 0 ? `<div class="people-tags">${renderPeopleHtml(item)}</div>` : '-'
						tr.innerHTML = `
							<td>
								<div class="table-entity-cell">
									${icon}
									${item.url ? `<a href="${item.url}" target="_blank">${item.name}</a>` : item.name}
								</div>
							</td>
							<td><span class="tag tag-type" onclick="addFilter('type', '${item.type}')">${item.type}</span></td>
							<td><span class="tag tag-country" onclick="addFilter('country', '${item.country}')">${flag} ${item.country}</span></td>
							<td>${item.year_last || '-'}</td>
							<td>${peopleLinks}</td>
						`
					} else {
						tr.innerHTML = `
							<td>
								<div class="table-entity-cell">
									${icon}
									${item.url ? `<a href="${item.url}" target="_blank">${item.name}</a>` : item.name}
								</div>
							</td>
							<td><span class="tag tag-type" onclick="addFilter('type', '${item.type}')">${item.type}</span></td>
							<td><span class="tag tag-country" onclick="addFilter('country', '${item.country}')">${flag} ${
							item.country || 'Global'
						}</span></td>
							<td>${item.verification_status || '-'}</td>
							<td>${
								item.url
									? `<a href="${item.url}" target="_blank" style="color:var(--accent-blue); font-weight:bold;">Visit &rarr;</a>`
									: ''
							}</td>
						`
					}
					tbody.appendChild(tr)
				})

				table.innerHTML = thead
				table.appendChild(tbody)
				wrapper.appendChild(table)
				container.appendChild(wrapper)
			}