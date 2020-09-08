#!/bin/bash
targetDir=$1
catName=$2 
returnDir=$(pwd)
idx=0
echo "we'll be returning to "$returnDir
cd $targetDir
echo "we're now inside"$(pwd)
for i in *.png 
do 
  echo "renaming "$i" to "$catName"_"$idx".png"
  mv $i $catName"_"$idx".png"
  ((idx++)) 
done
cd $returnDir
