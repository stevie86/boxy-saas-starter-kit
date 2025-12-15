# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - status [ref=e2]:
    - generic [ref=e3]:
      - img [ref=e5]
      - generic [ref=e7]:
        - text: Static route
        - button "Hide static indicator" [ref=e8] [cursor=pointer]:
          - img [ref=e9]
  - alert [ref=e12]
  - main [ref=e13]:
    - generic [ref=e14]:
      - heading "HostelPulse" [level=1] [ref=e17]
      - generic [ref=e19]:
        - heading "Please log in to continue." [level=1] [ref=e20]
        - generic [ref=e21]:
          - generic [ref=e22]:
            - generic [ref=e23]: Email
            - textbox "Email" [ref=e25]:
              - /placeholder: Enter your email address
          - generic [ref=e26]:
            - generic [ref=e27]: Password
            - textbox "Password" [ref=e29]:
              - /placeholder: Enter password
        - button "Log in" [ref=e30] [cursor=pointer]
        - paragraph [ref=e32]: "Demo: admin@hostelpulse.com / password"
```