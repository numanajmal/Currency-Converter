import { Component, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExchangeRateService } from './exchange-rate.service';

interface Currency {
    code: string;
    name: string;
    rate: number;
    countryCode: string; // ISO 3166-1 alpha-2 code for flags
}

@Component({
    selector: 'app-converter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './converter.html'
})
export class ConverterComponent implements OnInit {
    // State
    amount = signal<number>(1000);
    fromCurrency = signal<string>('USD');
    toCurrency = signal<string>('EUR');
    isLoading = signal<boolean>(false);
    error = signal<string>('');

    // Selection Modal State
    isSelectorOpen = signal<boolean>(false);
    selectorType = signal<'from' | 'to'>('from');
    searchQuery = signal<string>('');

    // Comprehensive list of Currencies with Country Codes
    currencies = signal<Currency[]>([
        { code: 'USD', name: 'US Dollar', rate: 1, countryCode: 'us' },
        { code: 'EUR', name: 'Euro', rate: 0.91, countryCode: 'eu' },
        { code: 'GBP', name: 'British Pound', rate: 0.76, countryCode: 'gb' },
        { code: 'JPY', name: 'Japanese Yen', rate: 142.95, countryCode: 'jp' },
        { code: 'AUD', name: 'Australian Dollar', rate: 1.50, countryCode: 'au' },
        { code: 'CAD', name: 'Canadian Dollar', rate: 1.36, countryCode: 'ca' },
        { code: 'CHF', name: 'Swiss Franc', rate: 0.85, countryCode: 'ch' },
        { code: 'CNY', name: 'Chinese Yuan', rate: 7.15, countryCode: 'cn' },
        { code: 'HKD', name: 'Hong Kong Dollar', rate: 7.82, countryCode: 'hk' },
        { code: 'NZD', name: 'New Zealand Dollar', rate: 1.62, countryCode: 'nz' },
        { code: 'SEK', name: 'Swedish Krona', rate: 10.25, countryCode: 'se' },
        { code: 'KRW', name: 'South Korean Won', rate: 1330.50, countryCode: 'kr' },
        { code: 'SGD', name: 'Singapore Dollar', rate: 1.34, countryCode: 'sg' },
        { code: 'NOK', name: 'Norwegian Krone', rate: 10.55, countryCode: 'no' },
        { code: 'MXN', name: 'Mexican Peso', rate: 17.05, countryCode: 'mx' },
        { code: 'INR', name: 'Indian Rupee', rate: 83.12, countryCode: 'in' },
        { code: 'RUB', name: 'Russian Ruble', rate: 91.50, countryCode: 'ru' },
        { code: 'ZAR', name: 'South African Rand', rate: 18.85, countryCode: 'za' },
        { code: 'TRY', name: 'Turkish Lira', rate: 30.05, countryCode: 'tr' },
        { code: 'BRL', name: 'Brazilian Real', rate: 4.95, countryCode: 'br' },
        { code: 'PKR', name: 'Pakistani Rupee', rate: 279.50, countryCode: 'pk' },
        { code: 'AED', name: 'UAE Dirham', rate: 3.67, countryCode: 'ae' },
        { code: 'SAR', name: 'Saudi Riyal', rate: 3.75, countryCode: 'sa' },
        { code: 'THB', name: 'Thai Baht', rate: 35.50, countryCode: 'th' },
        { code: 'IDR', name: 'Indonesian Rupiah', rate: 15600, countryCode: 'id' },
        { code: 'MYR', name: 'Malaysian Ringgit', rate: 4.72, countryCode: 'my' },
        { code: 'VND', name: 'Vietnamese Dong', rate: 24500, countryCode: 'vn' },
        { code: 'PHP', name: 'Philippine Peso', rate: 56.20, countryCode: 'ph' },
        { code: 'PLN', name: 'Polish Zloty', rate: 3.98, countryCode: 'pl' },
        { code: 'CZK', name: 'Czech Koruna', rate: 22.80, countryCode: 'cz' },
        { code: 'HUF', name: 'Hungarian Forint', rate: 355.00, countryCode: 'hu' },
        { code: 'ILS', name: 'Israeli Shekel', rate: 3.65, countryCode: 'il' },
        { code: 'CLP', name: 'Chilean Peso', rate: 950.00, countryCode: 'cl' },
        { code: 'ARS', name: 'Argentine Peso', rate: 840.00, countryCode: 'ar' },
        { code: 'COP', name: 'Colombian Peso', rate: 3950.00, countryCode: 'co' },
        { code: 'DKK', name: 'Danish Krone', rate: 6.85, countryCode: 'dk' },
        { code: 'EGP', name: 'Egyptian Pound', rate: 30.90, countryCode: 'eg' },
    ]);

    // Computed values
    convertedAmount = computed(() => {
        const from = this.currencies().find(c => c.code === this.fromCurrency());
        const to = this.currencies().find(c => c.code === this.toCurrency());
        if (from && to) {
            return (this.amount() / from.rate) * to.rate;
        }
        return 0;
    });

    filteredCurrencies = computed(() => {
        const query = this.searchQuery().toLowerCase();
        return this.currencies().filter(c =>
            c.code.toLowerCase().includes(query) ||
            c.name.toLowerCase().includes(query)
        );
    });

    currentTime = signal<string>(new Date().toUTCString());

    constructor(private exchangeRateService: ExchangeRateService) {
        setInterval(() => {
            this.currentTime.set(new Date().toUTCString());
        }, 1000);
    }

    ngOnInit() {
        // Fetch live exchange rates on component initialization
        this.updateExchangeRates();
        
        // Refresh rates every 5 minutes
        setInterval(() => {
            this.updateExchangeRates();
        }, 300000);
    }

    updateExchangeRates() {
        this.isLoading.set(true);
        this.error.set('');
        
        this.exchangeRateService.getExchangeRates('USD').subscribe({
            next: (response) => {
                if (response && response.rates) {
                    // Update currency rates with live data
                    const updatedCurrencies = this.currencies().map(currency => ({
                        ...currency,
                        rate: response.rates[currency.code] || currency.rate
                    }));
                    this.currencies.set(updatedCurrencies);
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to fetch exchange rates:', err);
                this.error.set('Unable to fetch live rates. Using cached rates.');
                this.isLoading.set(false);
            }
        });
    }

    swapCurrencies() {
        const temp = this.fromCurrency();
        this.fromCurrency.set(this.toCurrency());
        this.toCurrency.set(temp);
    }

    getRateFor(code: string) {
        const base = this.currencies().find(c => c.code === this.fromCurrency());
        const target = this.currencies().find(c => c.code === code);
        if (base && target) {
            if (target.rate / base.rate < 0.01) {
                return (target.rate / base.rate).toExponential(2);
            }
            return (target.rate / base.rate).toFixed(2);
        }
        return '0';
    }

    getFlagUrl(countryCode: string) {
        return `https://flagcdn.com/w40/${countryCode}.png`;
    }

    getCountryCode(currencyCode: string) {
        return this.currencies().find(c => c.code === currencyCode)?.countryCode || 'us';
    }

    // Selection Logic
    openSelector(type: 'from' | 'to') {
        this.selectorType.set(type);
        this.isSelectorOpen.set(true);
        this.searchQuery.set('');
    }

    closeSelector() {
        this.isSelectorOpen.set(false);
    }

    selectCurrency(code: string) {
        if (this.selectorType() === 'from') {
            this.fromCurrency.set(code);
        } else {
            this.toCurrency.set(code);
        }
        this.closeSelector();
    }
}
