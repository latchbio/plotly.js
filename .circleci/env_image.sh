#!/bin/sh
sudo apt-get install fonts-liberation2 fonts-open-sans fonts-noto-cjk && \
sudo python3 .circleci/download_google_fonts.py && \
sudo cp -r .circleci/fonts/ /usr/share/ && \
sudo fc-cache -f && \
sudo python3 -m pip install kaleido==0.2.1 plotly==5.1.0
