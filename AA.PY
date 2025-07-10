import requests
import json
import http.client

class StarMapReportAPI:
    def __init__(self, rapidapi_key):
        """
        Initialize the Star Map Report API client
        
        Args:
            rapidapi_key (str): Your RapidAPI key for The Numerology API
        """
        self.base_url = "https://the-numerology-api.p.rapidapi.com"
        self.headers = {
            "x-rapidapi-key": rapidapi_key,
            "x-rapidapi-host": "the-numerology-api.p.rapidapi.com"
        }

    def safe_json(self, response):
        try:
            return response.json()
        except (json.JSONDecodeError, ValueError):
            return {"status_code": response.status_code, "raw": response.text}    def get_birth_chart_json(self, name, year, month, day, hour=12, minute=0, 
                           lat=None, lng=None, city=None, country=None, tz="UTC"):
        """
        Get birth chart data in JSON format
        
        Args:
            name (str): Person's name
            year (int): Birth year
            month (int): Birth month (1-12)
            day (int): Birth day (1-31)
            hour (int): Birth hour (0-23), default 12
            minute (int): Birth minute (0-59), default 0
            lat (float): Latitude of birthplace
            lng (float): Longitude of birthplace
            city (str): City of birth
            country (str): Country code or name
            tz (str): Timezone string
        """
        url = f"{self.base_url}/birth-chart"
        params = {
            "name": name,
            "year": year,
            "month": month,
            "day": day,
            "hour": hour,
            "minute": minute
        }
        
        # Add optional location parameters
        if lat is not None:
            params["lat"] = lat
        if lng is not None:
            params["lng"] = lng
        if city:
            params["city"] = city
        if country:
            params["country"] = country
        if tz:
            params["tz"] = tz
            
        response = requests.get(url, headers=self.headers, params=params)
        return self.safe_json(response)

    def get_birth_chart_svg(self, name, year, month, day, hour=12, minute=0,
                          lat=None, lng=None, city=None, country=None, tz="UTC",
                          lang="EN", theme="classic"):
        """
        Get birth chart as SVG visualization
        
        Args:
            name (str): Person's name
            year (int): Birth year
            month (int): Birth month (1-12)
            day (int): Birth day (1-31)
            hour (int): Birth hour (0-23), default 12
            minute (int): Birth minute (0-59), default 0
            lat (float): Latitude of birthplace
            lng (float): Longitude of birthplace
            city (str): City of birth
            country (str): Country code or name
            tz (str): Timezone string
            lang (str): Language (EN, FR, PT, IT, CN, ES, RU, TR, DE, HI)
            theme (str): Theme (classic, light, dark, dark-high-contrast)
        """
        url = f"{self.base_url}/birth-chart/svg"
        params = {
            "name": name,
            "year": year,
            "month": month,
            "day": day,
            "hour": hour,
            "minute": minute,
            "lang": lang,
            "theme": theme
        }
        
        # Add optional location parameters
        if lat is not None:
            params["lat"] = lat
        if lng is not None:
            params["lng"] = lng
        if city:
            params["city"] = city
        if country:
            params["country"] = country
        if tz:
            params["tz"] = tz
            
        response = requests.get(url, headers=self.headers, params=params)
        return response.text

    def get_daily_horoscope(self, dob):
        """
        Get daily horoscope
        
        Args:
            dob (str): Date of birth in YYYY-MM-DD format
        """
        url = f"{self.base_url}/horoscope/today"
        params = {"dob": dob}
        response = requests.get(url, headers=self.headers, params=params)
        return self.safe_json(response)

    def get_weekly_horoscope(self, dob):
        """
        Get weekly horoscope
        
        Args:
            dob (str): Date of birth in YYYY-MM-DD format
        """
        url = f"{self.base_url}/horoscope/weekly"
        params = {"dob": dob}
        response = requests.get(url, headers=self.headers, params=params)
        return self.safe_json(response)

    def get_monthly_horoscope(self, dob):
        """
        Get monthly horoscope
        
        Args:
            dob (str): Date of birth in YYYY-MM-DD format
        """
        url = f"{self.base_url}/horoscope/monthly"
        params = {"dob": dob}
        response = requests.get(url, headers=self.headers, params=params)
        return self.safe_json(response)

    def get_daily_planetary_horoscope(self, dob):
        """
        Get daily planetary horoscope
        
        Args:
            dob (str): Date of birth in YYYY-MM-DD format
        """
        url = f"{self.base_url}/horoscope/planetary/daily"
        params = {"dob": dob, "day": "today"}
        response = requests.get(url, headers=self.headers, params=params)
        return self.safe_json(response)

    def get_weekly_planetary_horoscope(self, dob):
        """
        Get weekly planetary horoscope
        
        Args:
            dob (str): Date of birth in YYYY-MM-DD format
        """
        url = f"{self.base_url}/horoscope/planetary/weekly"
        params = {"dob": dob}
        response = requests.get(url, headers=self.headers, params=params)
        return self.safe_json(response)

    def get_monthly_planetary_horoscope(self, dob):
        """
        Get monthly planetary horoscope
        
        Args:
            dob (str): Date of birth in YYYY-MM-DD format
        """
        url = f"{self.base_url}/horoscope/planetary/monthly"
        params = {"dob": dob}
        response = requests.get(url, headers=self.headers, params=params)
        return self.safe_json(response)

    def get_astrology_aspect(self, aspect):
        """
        Get astrology aspect information
        
        Args:
            aspect (str): conjunction, opposite, square, trine, sextile
        """
        url = f"{self.base_url}/horoscope/astrology/aspect"
        params = {"aspect": aspect}
        response = requests.get(url, headers=self.headers, params=params)
        return self.safe_json(response)

    def get_astrology_house(self, house):
        """
        Get astrology house information
        
        Args:
            house (str): first, second, third, fourth, fifth, sixth, seventh, 
                        eighth, ninth, tenth, eleventh, twelfth
        """
        url = f"{self.base_url}/horoscope/astrology/house"
        params = {"house": house}
        response = requests.get(url, headers=self.headers, params=params)
        return self.safe_json(response)


# USAGE EXAMPLE
if __name__ == "__main__":
    # Initialize the API client
    api_key = "8c40e6d32emsh0127cfbba73f121p1d8a0ejsnd24c9ea2bfd1"
    star_map = StarMapReportAPI(api_key)
    
    # Example: Get birth chart JSON
    birth_chart = star_map.get_birth_chart_json(
        "John Doe", 1990, 7, 16,
        lat=48.8566, lng=2.3522, city="Paris", country="FR", tz="Europe/Paris"
    )
    print("Birth Chart (JSON):", json.dumps(birth_chart, indent=2))

    # Example: Get birth chart SVG and save to file
    svg_content = star_map.get_birth_chart_svg(
        "John Doe", 1990, 7, 16,
        lat=48.8566, lng=2.3522, city="Paris", country="FR", tz="Europe/Paris", lang="EN", theme="dark"
    )
    with open("birth_chart.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("SVG saved as birth_chart.svg")

    # Example: Get daily/weekly/monthly horoscopes
    dob = "1990-07-16"
    print("Daily Horoscope:", star_map.get_daily_horoscope(dob))
    print("Weekly Horoscope:", star_map.get_weekly_horoscope(dob))
    print("Monthly Horoscope:", star_map.get_monthly_horoscope(dob))

    # Example: Get planetary horoscopes
    print("Daily Planetary Horoscope:", star_map.get_daily_planetary_horoscope(dob))
    print("Weekly Planetary Horoscope:", star_map.get_weekly_planetary_horoscope(dob))
    print("Monthly Planetary Horoscope:", star_map.get_monthly_planetary_horoscope(dob))

    # Example: Get astrology house and aspect info
    print("First House Info:", star_map.get_astrology_house("first"))
    print("Conjunction Aspect Info:", star_map.get_astrology_aspect("conjunction"))