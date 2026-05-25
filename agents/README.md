# Code Evaluation Agent

A FastAPI-based agent powered by LangChain and OpenAI to evaluate code submissions.

## Prerequisites

- Python 3.9+
- OpenAI API Key

## Setup

1. **Create and Activate Virtual Environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables:**
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Fill in your `OPENAI_API_KEY`.

## Running the Agent

You can start the agent using uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 5001 --reload
```

Or simply run the main script:

```bash
python main.py
```

The server will start on [http://localhost:5001](http://localhost:5001) by default (or the port specified in your `.env`).

## API Endpoints

- `GET /api/health`: Health check endpoint.
- `POST /api/evaluate`: Evaluate code based on problem description and test cases.

## Development

The server uses `uvicorn` with hot-reload enabled in `main.py`, so changes to the code will automatically restart the server.
