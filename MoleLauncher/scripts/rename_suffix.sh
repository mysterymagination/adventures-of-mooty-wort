#!/bin/bash
targetDir=$1
idx=$2 
returnDir=$(pwd)
echo "we'll be returning to "$returnDir
cd $targetDir
echo "we're now inside"$(pwd)
for i in *.png 
do 
  baseStr=$(basename $i .png)
  echo "adding _"$idx" to "$baseStr
  mv $i $baseStr"_"$idx".png" 
done
cd $returnDir
