import requests
import json
import time

# Test the API endpoint
url = "http://localhost:8000/api/analyze"

test_data = {
    "startup_data": {
        "product_technology": {
            "product_type": "SaaS",
            "current_features": ["User authentication", "Dashboard"],
            "tech_stack": ["Python", "React"],
            "data_strategy": "User Data",
            "ai_usage": "Planned",
            "tech_challenges": "Need to scale infrastructure"
        },
        "marketing_growth": {
            "current_marketing_channels": ["Social Media", "Content Marketing"],
            "monthly_users": 1000,
            "customer_acquisition_cost": "$50",
            "retention_strategy": "Email campaigns",
            "growth_problems": "Low conversion rate"
        },
        "team_organization": {
            "team_size": 5,
            "founder_roles": ["CEO", "CTO"],
            "hiring_plan_next_3_months": "Hire 2 engineers",
            "org_challenges": "Remote team coordination"
        },
        "competition_market": {
            "known_competitors": ["Competitor A", "Competitor B"],
            "unique_advantage": "Better UX and pricing",
            "pricing_model": "Subscription",
            "market_risks": "Market saturation"
        },
        "finance_runway": {
            "monthly_burn": "$20000",
            "current_revenue": "$10000",
            "funding_status": "Seed",
            "runway_months": "12",
            "financial_concerns": "Need to increase revenue"
        }
    }
}

print("Sending test request to API...")
print(f"URL: {url}")
print(f"Data: {json.dumps(test_data, indent=2)}")

try:
    response = requests.post(url, json=test_data)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        result = response.json()
        analysis_id = result.get('analysis_id')
        
        if analysis_id:
            print(f"\n✓ Analysis submitted successfully!")
            print(f"Analysis ID: {analysis_id}")
            
            # Check status
            print("\nChecking status after 5 seconds...")
            time.sleep(5)
            
            status_url = f"http://localhost:8000/api/results/{analysis_id}"
            status_response = requests.get(status_url)
            print(f"Status: {json.dumps(status_response.json(), indent=2)}")
    else:
        print(f"\n✗ Request failed with status {response.status_code}")
        
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
