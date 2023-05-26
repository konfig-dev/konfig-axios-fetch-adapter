if [ -f .env ]; then
    yarn vite
else
    echo "The .env file does not exist. Create an .env file and put VITE_OPENAI_API_KEY in there."
fi
