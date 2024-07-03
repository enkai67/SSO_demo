# SSO_demo
# Single Sign-On (SSO) Demo

## Overview
This project demonstrates a basic Single Sign-On (SSO) implementation using Node.js and Express. The demo includes a Central Authentication Service (CAS) server and a client application (App1) that integrates with the CAS for authentication. This setup allows a user to log in once and gain access to multiple applications without needing to authenticate again for each service.

## Features
- **CAS Server**: Centralizes user authentication and session management.
- **App1 Client**: An example client application that uses the CAS for user authentication.
- **Secure Sessions**: Utilizes cookies and session storage to maintain user sessions securely.
- **Redis Session Store**: Leverages Redis to manage session storage, ensuring quick access and scalability.

## Prerequisites
Before you start, ensure you have the following installed:
- Node.js (v12.0 or higher recommended)
- npm (Node Package Manager)
- Redis server

## Installation

1. **Clone the Repository**

2. **Install Dependencies**
Navigate to both the CAS and App1 directories and install the required Node modules.

3. **Configure Redis**
Ensure your Redis server is running. Modify the Redis connection settings in the project files if your setup differs from the default (`localhost:6379`) for CAS and (`localhost:6380`) for App1.

## Usage

1. **Start the CAS Server**

2. **Start the App1 Client**

3. **Access the Applications**
- Open a browser and navigate to `http://localhost:4000/` to access App1.
- You will be redirected to the CAS login page if not logged in.

## Architecture

- **CAS Server**: Handles user authentication requests and issues tickets for validated sessions.
- **App1**: Demonstrates how a client application can use SSO for user authentication. It checks for authentication tickets and validates them with the CAS.

## Contributing
Contributions to this project are welcome! Please fork the repository and submit a pull request with your features or fixes.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details.

