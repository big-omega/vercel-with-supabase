#! /bin/bash
set -ex

cd `dirname $0`

vercel deploy --prod --yes
