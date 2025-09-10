#! /bin/bash
set -ex

cd `dirname $0`

cd app-with-supabase
vercel deploy --prod --yes
